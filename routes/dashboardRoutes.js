const express = require('express');
const { listingCreateSchema, listingUpdateSchema } = require('../config/validation');
const { validateBody } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

module.exports = (db) => {
    const router = express.Router();

    function getUserFromHeaders(req) {
        return {
            role: (req.headers['x-user-role'] || '').toLowerCase(),
            email: req.headers['x-user-email'] || '',
        };
    }

    function dashboardAuth(req, res, next) {
        const user = getUserFromHeaders(req);
        if (!user.role || !user.email) {
            return res.status(401).json({ success: false, error: 'Missing user authentication headers' });
        }

        if (user.role === 'admin' && process.env.ADMIN_KEY && req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
            return res.status(401).json({ success: false, error: 'Unauthorized admin access' });
        }

        req.user = user;
        next();
    }

    router.get('/test', (req, res) => {
        res.json({ success: true, message: 'Dashboard router test' });
    });

    router.get('/dashboard/summary', dashboardAuth, asyncHandler(async (req, res) => {
        const { role, email } = req.user;
        const now = new Date().toISOString();

        if (role === 'client') {
            const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders WHERE customer_email = ?').get(email).count || 0;
            const totalSpent = db.prepare('SELECT SUM(amount) as total FROM orders WHERE customer_email = ? AND status = ?').get(email, 'paid').total || 0;
            const recentOrders = db.prepare('SELECT id, vehicle_name, amount, status, created_at FROM orders WHERE customer_email = ? ORDER BY created_at DESC LIMIT 6').all(email);
            const recommendations = db.prepare('SELECT id, brand, model, price, image FROM listings WHERE isActive = 1 ORDER BY createdAt DESC LIMIT 6').all();

            return res.json({
                success: true,
                data: {
                    role,
                    email,
                    orderCount,
                    totalSpent,
                    recentOrders,
                    recommendations,
                    message: 'Client dashboard summary loaded',
                    currentTime: now,
                }
            });
        }

        if (role === 'dealer') {
            const activeListingsCount = db.prepare('SELECT COUNT(*) as count FROM listings WHERE dealer_email = ? AND isActive = 1').get(email).count || 0;
            const pendingApplicationCount = db.prepare('SELECT COUNT(*) as count FROM dealer_applications WHERE email = ? AND status = ?').get(email, 'pending').count || 0;
            const activeOrders = db.prepare(`
                SELECT o.id, o.vehicle_name, o.amount, o.status, o.created_at
                FROM orders o
                JOIN listings l ON l.id = o.vehicle_id
                WHERE l.dealer_email = ?
                ORDER BY o.created_at DESC
                LIMIT 6
            `).all(email);
            const recentListings = db.prepare('SELECT id, brand, model, price, city, isActive FROM listings WHERE dealer_email = ? ORDER BY createdAt DESC LIMIT 6').all(email);
            const totalRevenue = db.prepare(`
                SELECT SUM(o.amount) as total
                FROM orders o
                JOIN listings l ON l.id = o.vehicle_id
                WHERE l.dealer_email = ? AND o.status = ?
            `).get(email, 'paid').total || 0;

            return res.json({
                success: true,
                data: {
                    role,
                    email,
                    activeListingsCount,
                    pendingApplicationCount,
                    totalRevenue,
                    activeOrders,
                    recentListings,
                    message: 'Dealer dashboard summary loaded',
                    currentTime: now,
                }
            });
        }

        if (role === 'liaison') {
            const leads = db.prepare('SELECT id, name, email, role, created_at FROM chat_users WHERE role IN (?, ?) ORDER BY created_at DESC LIMIT 10').all('client', 'dealer');
            const commissionStats = db.prepare('SELECT COUNT(*) as count, SUM(amount * 0.02) as estimate FROM orders WHERE liaison_email = ? AND status = ?').get(email, 'paid');
            const activeDeals = db.prepare('SELECT id, vehicle_name, amount, status, created_at FROM orders WHERE liaison_email = ? ORDER BY created_at DESC LIMIT 6').all(email);

            return res.json({
                success: true,
                data: {
                    role,
                    email,
                    leads,
                    activeDeals,
                    commissionEstimate: commissionStats.estimate || 0,
                    successfulDeals: commissionStats.count || 0,
                    message: 'Liaison dashboard summary loaded',
                    currentTime: now,
                }
            });
        }

        if (role === 'admin') {
            const dashboardStats = require('../config/database').getDatabaseStats(db);
            const pendingDeals = db.prepare('SELECT COUNT(*) as count FROM pending_listings WHERE status = ?').get('pending').count || 0;
            const applications = db.prepare('SELECT COUNT(*) as count FROM dealer_applications WHERE status = ?').get('pending').count || 0;
            const latestOrders = db.prepare('SELECT id, vehicle_name, amount, status, customer_email, created_at FROM orders ORDER BY created_at DESC LIMIT 6').all();
            const latestListings = db.prepare('SELECT id, brand, model, price, city, isActive FROM listings ORDER BY createdAt DESC LIMIT 6').all();

            return res.json({
                success: true,
                data: {
                    role,
                    email,
                    stats: dashboardStats,
                    pendingDeals,
                    applications,
                    latestOrders,
                    latestListings,
                    message: 'Admin dashboard summary loaded',
                    currentTime: now,
                }
            });
        }

        return res.status(400).json({ success: false, error: 'Unknown dashboard role' });
    }));

    router.get('/client/orders', dashboardAuth, asyncHandler(async (req, res) => {
        if (req.user.role !== 'client') {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        const orders = db.prepare('SELECT id, vehicle_name, amount, status, created_at FROM orders WHERE customer_email = ? ORDER BY created_at DESC').all(req.user.email);
        return res.json({ success: true, data: orders });
    }));

    router.get('/dealer/listings', dashboardAuth, asyncHandler(async (req, res) => {
        if (req.user.role !== 'dealer') {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        const listings = db.prepare('SELECT * FROM listings WHERE dealer_email = ? ORDER BY createdAt DESC').all(req.user.email);
        return res.json({ success: true, data: listings });
    }));

    router.post('/dealer/listings', dashboardAuth, validateBody(listingCreateSchema), asyncHandler(async (req, res) => {
        if (req.user.role !== 'dealer') {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const {
            brand, model, price, nation, category, condition,
            body_style, fuel_type, drivetrain, color, city,
            image, badges, specs, rating
        } = req.validated;

        const result = db.prepare(`
            INSERT INTO listings (
                brand, model, price, nation, category, condition,
                body_style, fuel_type, drivetrain, color, city,
                image, badges, specs, rating, dealer_email
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            brand,
            model,
            price,
            nation,
            category,
            condition,
            body_style,
            fuel_type,
            drivetrain,
            color,
            city,
            image || null,
            badges ? JSON.stringify(badges) : '[]',
            specs ? JSON.stringify(specs) : '{}',
            rating || 4.5,
            req.user.email
        );

        return res.json({ success: true, id: result.lastInsertRowid, message: 'Listing created successfully' });
    }));

    router.put('/dealer/listings/:id', dashboardAuth, validateBody(listingUpdateSchema), asyncHandler(async (req, res) => {
        if (req.user.role !== 'dealer') {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const listing = db.prepare('SELECT * FROM listings WHERE id = ? AND dealer_email = ?').get(req.params.id, req.user.email);
        if (!listing) {
            return res.status(404).json({ success: false, error: 'Listing not found' });
        }

        const {
            brand, model, price, nation, category, condition,
            body_style, fuel_type, drivetrain, color, city,
            image, badges, specs, rating, isActive
        } = req.validated;

        db.prepare(`
            UPDATE listings SET
                brand = ?, model = ?, price = ?, nation = ?, category = ?,
                condition = ?, body_style = ?, fuel_type = ?, drivetrain = ?,
                color = ?, city = ?, image = ?, badges = ?, specs = ?, rating = ?, isActive = ?
            WHERE id = ? AND dealer_email = ?
        `).run(
            brand,
            model,
            price,
            nation,
            category,
            condition,
            body_style,
            fuel_type,
            drivetrain,
            color,
            city,
            image || null,
            badges ? JSON.stringify(badges) : '[]',
            specs ? JSON.stringify(specs) : '{}',
            rating || 4.5,
            isActive !== undefined ? (isActive ? 1 : 0) : 1,
            req.params.id,
            req.user.email
        );

        return res.json({ success: true, message: 'Listing updated successfully' });
    }));

    router.delete('/dealer/listings/:id', dashboardAuth, asyncHandler(async (req, res) => {
        if (req.user.role !== 'dealer') {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const result = db.prepare('UPDATE listings SET isActive = 0 WHERE id = ? AND dealer_email = ?').run(req.params.id, req.user.email);
        if (!result.changes) {
            return res.status(404).json({ success: false, error: 'Listing not found or not owned by dealer' });
        }

        return res.json({ success: true, message: 'Listing deleted successfully' });
    }));

    router.get('/liaison/leads', dashboardAuth, asyncHandler(async (req, res) => {
        if (req.user.role !== 'liaison') {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const leads = db.prepare('SELECT id, name, email, role, created_at FROM chat_users WHERE role IN (?, ?) ORDER BY created_at DESC LIMIT 10').all('client', 'dealer');
        return res.json({ success: true, data: leads });
    }));

    return router;
};
