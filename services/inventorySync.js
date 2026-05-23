/**
 * Inventory Synchronization Service
 * Syncs inventory across OmniDrive platforms, external sources, and mobile app
 */

const axios = require('axios');
const logger = require('../config/logger');

class InventorySyncService {
    constructor(db, queueManager, wsManager) {
        this.db = db;
        this.queueManager = queueManager;
        this.wsManager = wsManager;
        this.syncSources = {};
    }

    /**
     * Register an external inventory source
     */
    registerSource(sourceId, config) {
        this.syncSources[sourceId] = {
            sourceId,
            name: config.name,
            endpoint: config.endpoint,
            apiKey: config.apiKey,
            lastSync: null,
            syncInterval: config.syncInterval || 3600000, // 1 hour default
            active: config.active !== false,
        };

        logger.info('Inventory source registered', { sourceId, name: config.name });
    }

    /**
     * Sync inventory from external source
     */
    async syncFromSource(sourceId) {
        const source = this.syncSources[sourceId];

        if (!source || !source.active) {
            logger.warn('Source not found or inactive', { sourceId });
            return { success: false, error: 'Source not available' };
        }

        try {
            logger.info('Starting inventory sync', { sourceId, name: source.name });

            // Fetch data from external source
            const vehicles = await this.fetchFromSource(source);

            if (!vehicles || vehicles.length === 0) {
                logger.warn('No vehicles fetched from source', { sourceId });
                return { success: true, itemsProcessed: 0 };
            }

            // Process and insert/update vehicles
            const results = await this.processVehicles(vehicles, sourceId);

            // Update sync timestamp
            source.lastSync = new Date();

            logger.info('Inventory sync completed', {
                sourceId,
                itemsProcessed: results.processed,
                itemsCreated: results.created,
                itemsUpdated: results.updated,
                itemsSkipped: results.skipped,
            });

            return {
                success: true,
                ...results,
                lastSync: source.lastSync,
            };
        } catch (error) {
            logger.error('Inventory sync failed', { sourceId, error: error.message });

            // Notify source administrator
            await this.queueManager.queueNotification(
                `source_${sourceId}_admin`,
                'sync-failed',
                {
                    sourceId,
                    error: error.message,
                    timestamp: new Date(),
                },
                ['email']
            );

            return { success: false, error: error.message };
        }
    }

    /**
     * Fetch vehicles from external source
     */
    async fetchFromSource(source) {
        try {
            const response = await axios.get(source.endpoint, {
                headers: {
                    'Authorization': `Bearer ${source.apiKey}`,
                    'X-Source-ID': source.sourceId,
                },
                timeout: 30000,
            });

            return response.data.vehicles || response.data;
        } catch (error) {
            logger.error('Failed to fetch from source', {
                sourceId: source.sourceId,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Process and sync vehicles
     */
    async processVehicles(vehicles, sourceId) {
        let created = 0;
        let updated = 0;
        let skipped = 0;

        const insertStmt = this.db.prepare(`
            INSERT INTO listings (
                brand, model, price, category, condition,
                body_style, fuel_type, drivetrain, color,
                image, rating, city, nation, isActive, dealer_email
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                price = excluded.price,
                image = excluded.image,
                rating = excluded.rating
        `);

        const checkStmt = this.db.prepare(
            'SELECT id FROM listings WHERE brand = ? AND model = ? AND price = ? LIMIT 1'
        );

        const transaction = this.db.transaction((vehiclesArray) => {
            for (const vehicle of vehiclesArray) {
                try {
                    // Validate vehicle data
                    if (!vehicle.brand || !vehicle.price) {
                        logger.debug('Skipping invalid vehicle', { brand: vehicle.brand });
                        skipped++;
                        continue;
                    }

                    const existing = checkStmt.get(vehicle.brand, vehicle.model, vehicle.price);

                    const firstImage = Array.isArray(vehicle.images)
                        ? (vehicle.images[0] || vehicle.image || null)
                        : (vehicle.image || null);

                    insertStmt.run(
                        vehicle.brand,
                        vehicle.model,
                        vehicle.price,
                        vehicle.category || 'Car',
                        vehicle.condition || 'Used',
                        vehicle.bodyStyle || vehicle.body_style || null,
                        vehicle.fuelType || vehicle.fuel_type || null,
                        vehicle.drivetrain || null,
                        vehicle.color || null,
                        firstImage,
                        vehicle.rating || 4.5,
                        vehicle.city || 'Nairobi',
                        vehicle.nation || 'Kenya',
                        1,
                        vehicle.dealer_email || null
                    );

                    if (existing) {
                        updated++;
                    } else {
                        created++;
                    }
                } catch (error) {
                    logger.warn('Failed to process vehicle', {
                        vehicleId: vehicle.id,
                        error: error.message,
                    });
                    skipped++;
                }
            }
        });

        transaction(vehicles);

        return { processed: vehicles.length, created, updated, skipped };
    }

    /**
     * Sync inventory across platforms (desktop ↔ mobile ↔ dealers)
     */
    async syncAcrossPlatforms(vehicleId) {
        try {
            const vehicle = this.db.prepare('SELECT * FROM listings WHERE id = ?').get(vehicleId);

            if (!vehicle) {
                return { success: false, error: 'Vehicle not found' };
            }

            // Notify WebSocket clients about the change
            if (this.wsManager) {
                this.wsManager.io.emit('inventory-synced', {
                    vehicleId,
                    vehicle,
                    platforms: ['web', 'mobile', 'dealer-app'],
                    timestamp: new Date(),
                });
            }

            // Queue sync to mobile app backend
            await this.queueSyncToMobileApp(vehicle);

            // Queue sync to dealer apps
            await this.queueSyncToDealerApps(vehicle);

            logger.info('Cross-platform inventory sync triggered', { vehicleId });

            return { success: true, synced: true };
        } catch (error) {
            logger.error('Cross-platform sync failed', { vehicleId, error: error.message });
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync inventory to mobile app
     */
    async queueSyncToMobileApp(vehicle) {
        // Queue job to push to mobile backend
        await this.queueManager.queueInventorySync(
            vehicle.dealer_email || 'mobile-sync',
            'mobile-app',
            'push'
        );
    }

    /**
     * Sync to dealer applications
     */
    async queueSyncToDealerApps(vehicle) {
        // Get all dealers interested in this category
        const dealers = this.db.prepare(`
            SELECT DISTINCT dealer_email FROM listings
            WHERE category = ? AND dealer_email IS NOT NULL AND dealer_email != ?
            LIMIT 10
        `).all(vehicle.category, vehicle.dealer_email || '');

        for (const dealer of dealers) {
            await this.queueManager.queueInventorySync(
                dealer.dealer_email,
                'dealer-app',
                'update'
            );
        }
    }

    /**
     * Get inventory sync status
     */
    getSourceStatus() {
        return Object.values(this.syncSources).map(source => ({
            ...source,
            nextSync: source.lastSync 
                ? new Date(source.lastSync.getTime() + source.syncInterval)
                : new Date(),
            status: source.active ? 'active' : 'inactive',
        }));
    }

    /**
     * Manual sync trigger
     */
    async triggerManualSync(sourceId) {
        return await this.syncFromSource(sourceId);
    }

    /**
     * Start automatic sync for all active sources
     */
    startAutoSync() {
        for (const [sourceId, source] of Object.entries(this.syncSources)) {
            if (source.active) {
                this.scheduleSyncInterval(sourceId, source.syncInterval);
            }
        }

        logger.info('Automatic inventory sync started for all sources');
    }

    /**
     * Schedule automatic sync at intervals
     */
    scheduleSyncInterval(sourceId, interval) {
        setInterval(async () => {
            await this.syncFromSource(sourceId);
        }, interval);
    }

    /**
     * Get sync statistics
     */
    getSyncStats() {
        const stats = {
            sourceCount: Object.keys(this.syncSources).length,
            activeSources: Object.values(this.syncSources).filter(s => s.active).length,
            sources: this.getSourceStatus(),
            totalVehicles: this.db.prepare('SELECT COUNT(*) as count FROM listings').get().count,
        };

        return stats;
    }
}

module.exports = InventorySyncService;
