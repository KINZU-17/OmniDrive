const logger = require('../config/logger');

/**
 * Initialize database indexes for optimal query performance.
 *
 * Core indexes are created with the schema in config/db.js. This adds a few extra
 * ones defensively — each runs in isolation so a single failure can never abort
 * server boot (node:sqlite throws synchronously on a bad statement).
 */
function initializeIndexes(db) {
    const extra = [
        'CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city)',
        'CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price)',
        'CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone)',
        'CREATE INDEX IF NOT EXISTS idx_dealers_email ON dealer_applications(email)',
        'CREATE INDEX IF NOT EXISTS idx_pending_seller ON pending_listings(seller_email)',
        'CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_room_members(user_id)',
    ];
    let ok = 0;
    for (const sql of extra) {
        try { db.exec(sql); ok++; } catch (e) { logger.warn('Index skipped', { sql, error: e.message }); }
    }
    logger.info('Database indexes initialized', { applied: ok, total: extra.length });
}

/**
 * Enable query optimization settings. Uses db.exec (node:sqlite has no .pragma()).
 */
function optimizeDatabase(db) {
    try {
        db.exec('PRAGMA journal_mode = WAL');
        db.exec('PRAGMA cache_size = -64000'); // 64MB
        db.exec('PRAGMA foreign_keys = ON');
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
