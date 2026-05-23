/**
 * WebSocket Real-Time Notifications Service
 * Manages live events: price updates, new listings, order status, messages
 */

const { Server } = require('socket.io');
const Redis = require('ioredis');
const logger = require('./logger');

class WebSocketManager {
    constructor(httpServer, redisClient) {
        this.io = new Server(httpServer, {
            cors: {
                origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
                methods: ['GET', 'POST'],
                credentials: true,
            },
            transports: ['websocket', 'polling'],
        });

        this.redis = redisClient;
        this.userSockets = new Map(); // Map userId -> [socketIds]
        this.setupMiddleware();
        this.setupEventHandlers();
        this.setupRedisSubscriptions();
    }

    setupMiddleware() {
        this.io.use((socket, next) => {
            const userId = socket.handshake.query.userId;
            const userType = socket.handshake.query.userType;

            if (!userId) {
                return next(new Error('Missing user ID'));
            }

            socket.userId = userId;
            socket.userType = userType || 'client';
            socket.joinedAt = Date.now();

            logger.debug('WebSocket authentication', { userId, userType });
            next();
        });
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            const { userId, userType } = socket;

            // Track user connections
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, []);
            }
            this.userSockets.get(userId).push(socket.id);

            logger.info('User connected', { userId, socketId: socket.id, userType });

            // Join user-specific room
            socket.join(`user:${userId}`);

            // Join type-specific room
            socket.join(`type:${userType}`);

            // ─── EVENT LISTENERS ───────────────────────────────────────
            socket.on('subscribe-price-alert', (vehicleId) => {
                socket.join(`vehicle:${vehicleId}`);
                logger.debug('Subscribed to price alert', { userId, vehicleId });
            });

            socket.on('unsubscribe-price-alert', (vehicleId) => {
                socket.leave(`vehicle:${vehicleId}`);
            });

            socket.on('subscribe-order', (orderId) => {
                socket.join(`order:${orderId}`);
                logger.debug('Subscribed to order updates', { userId, orderId });
            });

            socket.on('subscribe-dealer-inventory', (dealerId) => {
                socket.join(`dealer:${dealerId}`);
                logger.debug('Subscribed to dealer inventory', { userId, dealerId });
            });

            socket.on('typing', (data) => {
                const { roomId, username } = data;
                socket.to(`room:${roomId}`).emit('user-typing', { userId, username });
            });

            socket.on('disconnect', () => {
                this.handleDisconnect(socket, userId);
            });

            // Send welcome message
            socket.emit('connected', {
                socketId: socket.id,
                userId,
                userType,
                timestamp: new Date(),
            });
        });
    }

    setupRedisSubscriptions() {
        const pubsub = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
            lazyConnect: true,
            retryStrategy: (times) => Math.min(times * 100, 3000),
            enableOfflineQueue: false,
        });

        pubsub.connect().then(() => {
            return pubsub.subscribe('notifications', 'inventory-updates', 'order-updates', 'price-alerts');
        }).then(() => {
            logger.info('WebSocket Redis subscriptions established');
        }).catch((err) => {
            logger.warn('WebSocket Redis subscriptions unavailable', { error: err.message });
        });

        pubsub.on('message', (channel, message) => {
            try {
                const data = JSON.parse(message);
                this.broadcastNotification(channel, data);
            } catch (error) {
                logger.error('Failed to parse Redis message', { channel, error: error.message });
            }
        });

        pubsub.on('error', (error) => {
            logger.warn('Redis subscription error', { error: error.message });
        });
    }

    // ──────────────────────────────────────────────────────────────────
    // NOTIFICATION METHODS
    // ──────────────────────────────────────────────────────────────────

    /**
     * Send notification to specific user
     */
    notifyUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, {
            ...data,
            timestamp: new Date(),
            event,
        });

        logger.debug('User notification sent', { userId, event });
    }

    /**
     * Notify about new vehicle listing
     */
    notifyNewListing(listing, interestedUsers = []) {
        // Broadcast to all clients
        this.io.to('type:client').emit('new-listing', {
            listing,
            category: listing.category,
        });

        // Notify interested users specifically
        interestedUsers.forEach(userId => {
            this.notifyUser(userId, 'new-listing-match', {
                listing,
                reason: 'Matches your preferences',
            });
        });

        logger.info('New listing notification broadcast', { listingId: listing.id });
    }

    /**
     * Notify about price change
     */
    notifyPriceChange(vehicleId, oldPrice, newPrice, percentChange) {
        const event = newPrice < oldPrice ? 'price-dropped' : 'price-increased';

        this.io.to(`vehicle:${vehicleId}`).emit(event, {
            vehicleId,
            oldPrice,
            newPrice,
            percentChange,
            savings: oldPrice - newPrice,
        });

        logger.info('Price change notification', { vehicleId, event, percentChange });
    }

    /**
     * Notify about order status update
     */
    notifyOrderUpdate(orderId, userId, status, details = {}) {
        this.notifyUser(userId, 'order-status-update', {
            orderId,
            status,
            message: this.getOrderStatusMessage(status),
            ...details,
        });

        logger.info('Order update notification', { orderId, userId, status });
    }

    /**
     * Notify about inventory change (for dealers)
     */
    notifyInventoryUpdate(dealerId, action, vehicle, count = null) {
        this.io.to(`dealer:${dealerId}`).emit('inventory-update', {
            action, // 'added', 'removed', 'updated'
            vehicle,
            totalCount: count,
        });

        logger.info('Inventory update notification', { dealerId, action });
    }

    /**
     * Broadcast notification via Redis
     */
    broadcastNotification(channel, data) {
        switch (channel) {
            case 'price-alerts':
                this.io.to(`vehicle:${data.vehicleId}`).emit('price-alert', data);
                break;

            case 'inventory-updates':
                this.io.to(`dealer:${data.dealerId}`).emit('inventory-changed', data);
                break;

            case 'order-updates':
                this.io.to(`order:${data.orderId}`).emit('order-update', data);
                break;

            case 'notifications':
                if (data.recipientId) {
                    this.io.to(`user:${data.recipientId}`).emit('notification', data);
                } else {
                    this.io.emit('broadcast-notification', data);
                }
                break;
        }
    }

    /**
     * Send message to user type group (e.g., all dealers)
     */
    notifyUserType(userType, event, data) {
        this.io.to(`type:${userType}`).emit(event, {
            ...data,
            timestamp: new Date(),
        });

        logger.debug('User type notification sent', { userType, event });
    }

    /**
     * Handle user disconnection
     */
    handleDisconnect(socket, userId) {
        const sockets = this.userSockets.get(userId) || [];
        const index = sockets.indexOf(socket.id);

        if (index > -1) {
            sockets.splice(index, 1);
        }

        if (sockets.length === 0) {
            this.userSockets.delete(userId);
            logger.info('User fully disconnected', { userId });
        } else {
            logger.debug('User socket disconnected', { userId, socketId: socket.id });
        }
    }

    /**
     * Get order status message
     */
    getOrderStatusMessage(status) {
        const messages = {
            'placed': 'Your order has been placed successfully',
            'confirmed': 'Your order has been confirmed',
            'processing': 'Your order is being processed',
            'shipped': 'Your order has been shipped',
            'in-transit': 'Your order is in transit',
            'delivered': 'Your order has been delivered',
            'cancelled': 'Your order has been cancelled',
            'refunded': 'Your order has been refunded',
        };

        return messages[status] || 'Order status updated';
    }

    /**
     * Get active users count
     */
    getActiveUsersCount() {
        return this.userSockets.size;
    }

    /**
     * Graceful shutdown
     */
    shutdown() {
        this.io.close();
        logger.info('WebSocket server shut down gracefully');
    }
}

module.exports = WebSocketManager;
