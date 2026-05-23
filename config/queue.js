/**
 * Bull Queue System for Background Jobs
 * Handles: email sending, image processing, inventory sync, notifications, reports
 */

const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const nodemailer = require('nodemailer');
const logger = require('./logger');

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000),
};

class QueueManager {
    constructor() {
        this.redis = new Redis(redisConfig);
        this.queues = {};
        this.workers = {};

        // Initialize email transporter
        this.emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // port 587 uses STARTTLS, not SSL (port 465 uses secure: true)
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        });

        this.initializeQueues();
    }

    initializeQueues() {
        // Email queue
        this.createQueue('emails', {
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: true,
            },
        });

        // Notifications queue
        this.createQueue('notifications', {
            defaultJobOptions: {
                attempts: 5,
                removeOnComplete: true,
            },
        });

        // Inventory sync queue
        this.createQueue('inventory-sync', {
            defaultJobOptions: {
                attempts: 3,
                removeOnComplete: true,
            },
        });

        // Image processing queue
        this.createQueue('image-processing', {
            defaultJobOptions: {
                attempts: 2,
                removeOnComplete: true,
            },
        });

        // Reports queue
        this.createQueue('reports', {
            defaultJobOptions: {
                attempts: 1,
                removeOnComplete: true,
            },
        });

        // Setup workers
        this.setupWorkers();

        logger.info('Queue system initialized with 5 queues');
    }

    createQueue(name, options = {}) {
        this.queues[name] = new Queue(name, {
            connection: redisConfig,
            ...options,
        });

        this.queues[name].on('error', (error) => {
            logger.error(`Queue ${name} error`, { error: error.message });
        });

        this.queues[name].on('failed', (job, error) => {
            logger.warn(`Job failed in ${name}`, {
                jobId: job.id,
                error: error.message,
                attempts: job.attemptsMade,
            });
        });

        return this.queues[name];
    }

    setupWorkers() {
        // Email worker
        this.workers.emails = new Worker('emails', this.processEmailJob.bind(this), {
            connection: redisConfig,
            concurrency: 10,
        });

        // Notifications worker
        this.workers.notifications = new Worker('notifications', this.processNotificationJob.bind(this), {
            connection: redisConfig,
            concurrency: 20,
        });

        // Inventory sync worker
        this.workers['inventory-sync'] = new Worker('inventory-sync', this.processInventorySyncJob.bind(this), {
            connection: redisConfig,
            concurrency: 5,
        });

        // Image processing worker
        this.workers['image-processing'] = new Worker('image-processing', this.processImageJob.bind(this), {
            connection: redisConfig,
            concurrency: 3,
        });

        // Reports worker
        this.workers.reports = new Worker('reports', this.processReportJob.bind(this), {
            connection: redisConfig,
            concurrency: 2,
        });

        // Setup completion handlers
        Object.values(this.workers).forEach((worker) => {
            worker.on('completed', (job) => {
                logger.debug(`Job completed: ${job.name}`, { jobId: job.id });
            });

            worker.on('failed', (job, error) => {
                logger.error(`Job failed: ${job.name}`, {
                    jobId: job.id,
                    error: error.message,
                });
            });
        });
    }

    // ──────────────────────────────────────────────────────────────────
    // JOB PROCESSORS
    // ──────────────────────────────────────────────────────────────────

    /**
     * Process email job
     */
    async processEmailJob(job) {
        const { to, subject, html, template } = job.data;

        try {
            await this.emailTransporter.sendMail({
                from: process.env.SMTP_FROM || 'noreply@omnidrive.co.ke',
                to,
                subject,
                html,
            });

            logger.info('Email sent successfully', { to, subject });
            return { success: true, messageId: Date.now() };
        } catch (error) {
            logger.error('Failed to send email', { to, error: error.message });
            throw error;
        }
    }

    /**
     * Process notification job
     */
    async processNotificationJob(job) {
        const { userId, type, data, channels = ['in-app'] } = job.data;

        try {
            const results = {};

            for (const channel of channels) {
                if (channel === 'in-app') {
                    results.inApp = await this.storeInAppNotification(userId, type, data);
                } else if (channel === 'email') {
                    results.email = await this.queues.emails.add('send', {
                        to: data.email,
                        subject: data.subject,
                        html: data.html,
                    });
                } else if (channel === 'sms') {
                    results.sms = await this.sendSMS(userId, data.message);
                }
            }

            logger.info('Notification processed', { userId, type, channels });
            return results;
        } catch (error) {
            logger.error('Failed to process notification', { userId, error: error.message });
            throw error;
        }
    }

    /**
     * Process inventory sync job
     */
    async processInventorySyncJob(job) {
        const { dealerId, sourceId, action } = job.data;

        try {
            // Sync logic here - pull from external source or sync between platforms
            const syncResult = {
                dealerId,
                sourceId,
                action,
                syncedAt: new Date(),
                itemsProcessed: 0,
            };

            logger.info('Inventory synced', syncResult);
            return syncResult;
        } catch (error) {
            logger.error('Inventory sync failed', { dealerId, error: error.message });
            throw error;
        }
    }

    /**
     * Process image optimization job
     */
    async processImageJob(job) {
        const { vehicleId, imagePath, format = 'webp', quality = 80 } = job.data;

        try {
            // Image processing logic here
            logger.info('Image processed', { vehicleId, format, quality });
            return { success: true, format, quality };
        } catch (error) {
            logger.error('Image processing failed', { vehicleId, error: error.message });
            throw error;
        }
    }

    /**
     * Process report generation job
     */
    async processReportJob(job) {
        const { reportType, filters, userId } = job.data;

        try {
            // Generate report based on type
            const report = {
                type: reportType,
                generatedAt: new Date(),
                filters,
                recordCount: 0,
            };

            logger.info('Report generated', { reportType, userId });
            return report;
        } catch (error) {
            logger.error('Report generation failed', { reportType, error: error.message });
            throw error;
        }
    }

    // ──────────────────────────────────────────────────────────────────
    // JOB SCHEDULING METHODS
    // ──────────────────────────────────────────────────────────────────

    /**
     * Queue email job
     */
    async queueEmail(to, subject, html) {
        return await this.queues.emails.add('send', {
            to,
            subject,
            html,
        });
    }

    /**
     * Queue notification
     */
    async queueNotification(userId, type, data, channels = ['in-app']) {
        return await this.queues.notifications.add('send', {
            userId,
            type,
            data,
            channels,
        }, {
            delay: data.delayMs || 0,
        });
    }

    /**
     * Queue inventory sync
     */
    async queueInventorySync(dealerId, sourceId, action = 'sync') {
        return await this.queues['inventory-sync'].add('sync', {
            dealerId,
            sourceId,
            action,
        }, {
            repeat: {
                pattern: process.env.INVENTORY_SYNC_CRON || '0 */6 * * *', // Every 6 hours
            },
        });
    }

    /**
     * Queue image processing
     */
    async queueImageProcessing(vehicleId, imagePath, format = 'webp') {
        return await this.queues['image-processing'].add('optimize', {
            vehicleId,
            imagePath,
            format,
            quality: 80,
        });
    }

    /**
     * Queue report generation
     */
    async queueReport(reportType, filters, userId) {
        return await this.queues.reports.add('generate', {
            reportType,
            filters,
            userId,
        });
    }

    // ──────────────────────────────────────────────────────────────────
    // HELPER METHODS
    // ──────────────────────────────────────────────────────────────────

    async storeInAppNotification(userId, type, data) {
        // Store notification in database/cache
        logger.debug('In-app notification stored', { userId, type });
        return { stored: true, timestamp: new Date() };
    }

    async sendSMS(userId, message) {
        // Integrate SMS provider (Twilio, etc.)
        logger.debug('SMS queued', { userId });
        return { queued: true };
    }

    /**
     * Get queue statistics
     */
    async getQueueStats() {
        const stats = {};

        for (const [name, queue] of Object.entries(this.queues)) {
            const counts = await queue.getCountsPerStatus();
            stats[name] = counts;
        }

        return stats;
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        for (const worker of Object.values(this.workers)) {
            await worker.close();
        }

        for (const queue of Object.values(this.queues)) {
            await queue.close();
        }

        await this.redis.quit();
        logger.info('Queue system shut down gracefully');
    }
}

module.exports = QueueManager;
