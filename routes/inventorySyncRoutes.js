/**
 * Inventory Synchronization API Routes
 * Endpoints for managing inventory sync from external sources
 */

const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

module.exports = (db, inventorySync, queueManager) => {
    /**
     * GET /api/inventory-sync/sources
     * Get all registered inventory sources and their status
     */
    router.get('/sources', (req, res) => {
        try {
            const sources = inventorySync.getSourceStatus();

            res.json({
                success: true,
                data: {
                    sources,
                    totalSources: sources.length,
                    activeSources: sources.filter(s => s.status === 'active').length,
                },
            });
        } catch (error) {
            logger.error('Failed to get inventory sources', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve inventory sources',
            });
        }
    });

    /**
     * POST /api/inventory-sync/sources
     * Register a new inventory source
     */
    router.post('/sources', (req, res) => {
        try {
            const { sourceId, name, endpoint, apiKey, syncInterval } = req.body;

            if (!sourceId || !name || !endpoint) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: sourceId, name, endpoint',
                });
            }

            inventorySync.registerSource(sourceId, {
                name,
                endpoint,
                apiKey,
                syncInterval,
            });

            res.status(201).json({
                success: true,
                message: 'Source registered successfully',
                data: { sourceId, name },
            });
        } catch (error) {
            logger.error('Failed to register source', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to register inventory source',
            });
        }
    });

    /**
     * POST /api/inventory-sync/sync/:sourceId
     * Manually trigger sync from specific source
     */
    router.post('/sync/:sourceId', async (req, res) => {
        try {
            const { sourceId } = req.params;

            const result = await inventorySync.syncFromSource(sourceId);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Inventory synced successfully',
                    data: {
                        sourceId,
                        itemsProcessed: result.processed,
                        itemsCreated: result.created,
                        itemsUpdated: result.updated,
                        lastSync: result.lastSync,
                    },
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error,
                });
            }
        } catch (error) {
            logger.error('Inventory sync failed', { sourceId: req.params.sourceId, error: error.message });
            res.status(500).json({
                success: false,
                error: 'Inventory sync failed',
            });
        }
    });

    /**
     * POST /api/inventory-sync/cross-platform/:vehicleId
     * Sync a vehicle across all platforms
     */
    router.post('/cross-platform/:vehicleId', async (req, res) => {
        try {
            const { vehicleId } = req.params;

            const result = await inventorySync.syncAcrossPlatforms(vehicleId);

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Vehicle synced across platforms',
                    data: {
                        vehicleId,
                        synced: true,
                        platforms: ['web', 'mobile', 'dealer-app'],
                    },
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error,
                });
            }
        } catch (error) {
            logger.error('Cross-platform sync failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Cross-platform sync failed',
            });
        }
    });

    /**
     * GET /api/inventory-sync/stats
     * Get inventory sync statistics
     */
    router.get('/stats', (req, res) => {
        try {
            const stats = inventorySync.getSyncStats();

            res.json({
                success: true,
                data: stats,
            });
        } catch (error) {
            logger.error('Failed to get sync stats', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve sync statistics',
            });
        }
    });

    /**
     * POST /api/inventory-sync/auto-start
     * Start automatic sync for all sources
     */
    router.post('/auto-start', (req, res) => {
        try {
            inventorySync.startAutoSync();

            res.json({
                success: true,
                message: 'Automatic inventory sync started',
                data: {
                    activeSources: inventorySync.getSourceStatus().filter(s => s.status === 'active').length,
                },
            });
        } catch (error) {
            logger.error('Failed to start auto sync', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to start automatic sync',
            });
        }
    });

    /**
     * GET /api/inventory-sync/queue-stats
     * Get background job queue statistics
     */
    router.get('/queue-stats', async (req, res) => {
        try {
            const queueStats = await queueManager.getQueueStats();

            res.json({
                success: true,
                data: {
                    queues: queueStats,
                    lastUpdated: new Date(),
                },
            });
        } catch (error) {
            logger.error('Failed to get queue stats', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve queue statistics',
            });
        }
    });

    return router;
};
