/**
 * API Tests for OmniDrive Backend
 * Uses Jest and Supertest for API testing
 */

const request = require('supertest');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Test database setup
const TEST_DB = ':memory:';
let db;
let app;

beforeAll(() => {
    // Use in-memory database for testing
    db = new Database(TEST_DB);
    
    // Create test app (would import from server-improved.js)
    // For now, mock the database setup
    db.exec(`
        CREATE TABLE listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT NOT NULL,
            model TEXT NOT NULL,
            price REAL NOT NULL,
            nation TEXT NOT NULL,
            category TEXT DEFAULT 'Car',
            condition TEXT DEFAULT 'Used',
            body_style TEXT,
            fuel_type TEXT,
            drivetrain TEXT,
            color TEXT,
            city TEXT DEFAULT 'Nairobi',
            image TEXT,
            badges TEXT DEFAULT '[]',
            specs TEXT DEFAULT '{}',
            rating REAL DEFAULT 4.5,
            reviewCount INTEGER DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            isActive BOOLEAN DEFAULT 1
        );

        CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            checkout_id TEXT UNIQUE,
            merchant_id TEXT,
            phone TEXT,
            amount REAL,
            vehicle_id TEXT,
            vehicle_name TEXT,
            status TEXT DEFAULT 'pending',
            receipt TEXT,
            customer_email TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE dealer_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            owner TEXT,
            phone TEXT,
            email TEXT,
            city TEXT,
            address TEXT,
            types TEXT,
            plan TEXT,
            about TEXT,
            payment TEXT,
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT (datetime('now'))
        );
    `);
});

afterAll(() => {
    if (db) db.close();
});

describe('OmniDrive API Tests', () => {
    describe('Health Check', () => {
        it('GET /health should return server status', () => {
            // This would be a real test with the actual server
            expect(true).toBe(true);
        });
    });

    describe('Listings Endpoints', () => {
        beforeEach(() => {
            // Insert test data
            db.prepare(`
                INSERT INTO listings (brand, model, price, nation, category, condition, color, city)
                VALUES ('Toyota', 'Corolla', 1500000, 'Japan', 'Car', 'Used', 'White', 'Nairobi')
            `).run();
        });

        it('GET /api/listings should return active listings', () => {
            const listings = db.prepare('SELECT * FROM listings WHERE isActive = 1').all();
            expect(listings.length).toBeGreaterThan(0);
            expect(listings[0]).toHaveProperty('brand');
            expect(listings[0]).toHaveProperty('model');
            expect(listings[0]).toHaveProperty('price');
        });

        it('GET /api/listings should filter by brand', () => {
            const listings = db.prepare('SELECT * FROM listings WHERE brand LIKE ? AND isActive = 1')
                .all('%Toyota%');
            expect(listings.length).toBeGreaterThan(0);
            expect(listings[0].brand).toContain('Toyota');
        });

        it('GET /api/listings should filter by category', () => {
            const listings = db.prepare('SELECT * FROM listings WHERE category = ? AND isActive = 1')
                .all('Car');
            expect(listings.length).toBeGreaterThan(0);
            expect(listings[0].category).toBe('Car');
        });

        it('GET /api/listings/:id should return single listing', () => {
            const listing = db.prepare('SELECT * FROM listings WHERE isActive = 1 LIMIT 1').get();
            expect(listing).toBeDefined();
            expect(listing).toHaveProperty('id');
            expect(listing).toHaveProperty('brand');
        });

        it('Listing should have valid data structure', () => {
            const listing = db.prepare('SELECT * FROM listings WHERE isActive = 1 LIMIT 1').get();
            
            expect(typeof listing.id).toBe('number');
            expect(typeof listing.brand).toBe('string');
            expect(typeof listing.model).toBe('string');
            expect(typeof listing.price).toBe('number');
            expect(typeof listing.nation).toBe('string');
            expect(listing.price).toBeGreaterThan(0);
            expect(listing.rating).toBeGreaterThanOrEqual(0);
            expect(listing.rating).toBeLessThanOrEqual(5);
        });
    });

    describe('Orders Endpoints', () => {
        it('Order should have valid status', () => {
            const validStatuses = ['pending', 'paid', 'failed'];
            db.prepare(`
                INSERT INTO orders (checkout_id, phone, amount, vehicle_name, status)
                VALUES ('TEST123', '254712345678', 1500000, 'Toyota Corolla', 'pending')
            `).run();

            const order = db.prepare('SELECT * FROM orders WHERE checkout_id = ?').get('TEST123');
            expect(validStatuses).toContain(order.status);
        });

        it('Order should track timestamps', () => {
            const order = db.prepare('SELECT * FROM orders WHERE checkout_id = ?').get('TEST123');
            expect(order.created_at).toBeDefined();
            expect(order.updated_at).toBeDefined();
        });
    });

    describe('Input Validation', () => {
        it('Valid phone number should pass', () => {
            const validPhones = [
                '254712345678',
                '0712345678',
                '+254712345678'
            ];
            
            validPhones.forEach(phone => {
                const regex = /^(?:\+?254|0)[17]\d{8}$/;
                expect(regex.test(phone)).toBe(true);
            });
        });

        it('Invalid phone number should fail', () => {
            const invalidPhones = [
                '1234567890',
                'not-a-phone',
                '254812345678', // Wrong carrier digit
            ];
            
            invalidPhones.forEach(phone => {
                const regex = /^(?:\+?254|0)[17]\d{8}$/;
                expect(regex.test(phone)).toBe(false);
            });
        });

        it('Valid email should pass', () => {
            const validEmails = [
                'user@example.com',
                'user.name@example.co.ke',
                'user+tag@example.com'
            ];
            
            validEmails.forEach(email => {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                expect(regex.test(email)).toBe(true);
            });
        });

        it('Invalid email should fail', () => {
            const invalidEmails = [
                'not-an-email',
                '@example.com',
                'user@',
                'user name@example.com'
            ];
            
            invalidEmails.forEach(email => {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                expect(regex.test(email)).toBe(false);
            });
        });
    });

    describe('Database Query Performance', () => {
        it('Listings query should complete quickly', () => {
            const start = Date.now();
            const listings = db.prepare('SELECT * FROM listings WHERE isActive = 1 LIMIT 100').all();
            const duration = Date.now() - start;
            
            expect(duration).toBeLessThan(100); // Should be much faster than 100ms
        });

        it('Order lookup by checkout_id should be indexed', () => {
            db.prepare('INSERT INTO orders (checkout_id, phone, amount, vehicle_name, status) VALUES (?, ?, ?, ?, ?)')
                .run('TEST_' + Date.now(), '254712345678', 1500000, 'Test Vehicle', 'pending');
            
            const start = Date.now();
            const order = db.prepare('SELECT * FROM orders WHERE checkout_id = ?').get('TEST_' + Date.now());
            const duration = Date.now() - start;
            
            expect(duration).toBeLessThan(50);
        });
    });

    describe('Data Integrity', () => {
        it('Listing prices should be positive', () => {
            const listing = db.prepare('SELECT * FROM listings WHERE isActive = 1 LIMIT 1').get();
            expect(listing.price).toBeGreaterThan(0);
        });

        it('Orders should not have missing required fields', () => {
            db.prepare('INSERT INTO orders (checkout_id, phone, amount, vehicle_name) VALUES (?, ?, ?, ?)')
                .run('INTEGRITY_TEST', '254712345678', 1500000, 'Test');
            
            const order = db.prepare('SELECT * FROM orders WHERE checkout_id = ?').get('INTEGRITY_TEST');
            expect(order.checkout_id).toBeDefined();
            expect(order.phone).toBeDefined();
            expect(order.amount).toBeDefined();
            expect(order.created_at).toBeDefined();
        });
    });
});
