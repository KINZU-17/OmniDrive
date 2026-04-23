const logger = require('../config/logger');

/**
 * Initialize database indexes for optimal query performance
 */
function initializeIndexes(db) {
    try {
        // Listings table indexes
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_listings_brand ON listings(brand);
            CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
            CREATE INDEX IF NOT EXISTS idx_listings_nation ON listings(nation);
            CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
            CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
            CREATE INDEX IF NOT EXISTS idx_listings_rating ON listings(rating);
            CREATE INDEX IF NOT EXISTS idx_listings_isActive ON listings(isActive);
            CREATE INDEX IF NOT EXISTS idx_listings_createdAt ON listings(createdAt);
            CREATE INDEX IF NOT EXISTS idx_listings_composite ON listings(isActive, createdAt);
        `);

        // Orders table indexes
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_orders_checkout_id ON orders(checkout_id);
            CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
            CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
            CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
            CREATE INDEX IF NOT EXISTS idx_orders_composite ON orders(status, created_at);
        `);

        // Dealer applications indexes
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_dealers_email ON dealer_applications(email);
            CREATE INDEX IF NOT EXISTS idx_dealers_status ON dealer_applications(status);
            CREATE INDEX IF NOT EXISTS idx_dealers_created_at ON dealer_applications(created_at);
            CREATE INDEX IF NOT EXISTS idx_dealers_composite ON dealer_applications(status, created_at);
        `);

        // Pending listings indexes
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_pending_brand ON pending_listings(brand);
            CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_listings(status);
            CREATE INDEX IF NOT EXISTS idx_pending_created_at ON pending_listings(created_at);
            CREATE INDEX IF NOT EXISTS idx_pending_seller_email ON pending_listings(seller_email);
            CREATE INDEX IF NOT EXISTS idx_pending_composite ON pending_listings(status, created_at);
        `);

        // Chat indexes
        db.exec(`
            CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
            CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
            CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
            CREATE INDEX IF NOT EXISTS idx_chat_room_members_room ON chat_room_members(room_id);
            CREATE INDEX IF NOT EXISTS idx_chat_room_members_user ON chat_room_members(user_id);
            CREATE INDEX IF NOT EXISTS idx_chat_reads_room ON chat_reads(room_id);
            CREATE INDEX IF NOT EXISTS idx_chat_reads_user ON chat_reads(user_id);
        `);

        logger.info('Database indexes initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize database indexes', { error: error.message });
        throw error;
    }
}

/**
 * Enable query optimization settings
 */
function optimizeDatabase(db) {
    try {
        // Enable WAL (Write-Ahead Logging) mode for better concurrency
        db.pragma('journal_mode = WAL');
        
        // Increase cache size
        db.pragma('cache_size = -64000'); // 64MB
        
        // Enable foreign keys
        db.pragma('foreign_keys = ON');
        
        logger.info('Database optimization applied');
    } catch (error) {
        logger.error('Failed to optimize database', { error: error.message });
    }
}

/**
 * Get database statistics
 */
function getDatabaseStats(db) {
    try {
        const stats = {
            listings: db.prepare('SELECT COUNT(*) as count FROM listings').get().count,
            orders: db.prepare('SELECT COUNT(*) as count FROM orders').get().count,
            dealers: db.prepare('SELECT COUNT(*) as count FROM dealer_applications').get().count,
            pendingListings: db.prepare('SELECT COUNT(*) as count FROM pending_listings').get().count,
            totalRevenue: db.prepare('SELECT SUM(amount) as total FROM orders WHERE status = ?').get('paid').total || 0,
            paidOrders: db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('paid').count,
        };
        return stats;
    } catch (error) {
        logger.error('Failed to get database stats', { error: error.message });
        return null;
    }
}

module.exports = {
    initializeIndexes,
    optimizeDatabase,
    getDatabaseStats,
};
