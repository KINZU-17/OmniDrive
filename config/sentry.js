const Sentry = require('@sentry/node');
const logger = require('./logger');

/**
 * Initialize Sentry for error tracking
 */
function initSentry(app) {
    if (!process.env.SENTRY_DSN) {
        logger.warn('Sentry DSN not configured - error tracking disabled');
        return;
    }
    
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
            new Sentry.Integrations.Http({ tracing: true }),
            new Sentry.Integrations.Express({
                app: true,
                request: true,
                serverName: false,
                transaction: true,
                user: true,
                version: false,
            }),
        ],
    });
    
    // Attach Sentry middleware
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.errorHandler());
    
    logger.info('Sentry initialized for error tracking', { 
        dsn: process.env.SENTRY_DSN?.split('@')[0] + '@...',
        environment: process.env.NODE_ENV,
    });
}

/**
 * Capture exception to Sentry
 */
function captureException(error, context = {}) {
    if (process.env.SENTRY_DSN) {
        Sentry.captureException(error, { 
            tags: context,
        });
    }
    logger.error('Exception captured', { error: error.message, context });
}

/**
 * Capture message to Sentry
 */
function captureMessage(message, level = 'info', context = {}) {
    if (process.env.SENTRY_DSN) {
        Sentry.captureMessage(message, level);
    }
    logger.log(level, message, context);
}

module.exports = {
    initSentry,
    captureException,
    captureMessage,
    Sentry,
};
