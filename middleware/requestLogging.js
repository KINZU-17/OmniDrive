const logger = require('../config/logger');

/**
 * Log incoming requests
 */
function requestLogger(req, res, next) {
    const start = Date.now();

    // Log request
    logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });

    // Override res.json to log response
    const originalJson = res.json.bind(res);
    res.json = function(data) {
        const duration = Date.now() - start;
        logger.info('Outgoing response', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
        });
        return originalJson(data);
    };

    next();
}

/**
 * Log slow requests
 */
function slowRequestLogger(threshold = 1000) {
    return (req, res, next) => {
        const start = Date.now();

        const originalJson = res.json.bind(res);
        res.json = function(data) {
            const duration = Date.now() - start;
            if (duration > threshold) {
                logger.warn('Slow request detected', {
                    method: req.method,
                    path: req.path,
                    duration: `${duration}ms`,
                    threshold: `${threshold}ms`,
                });
            }
            return originalJson(data);
        };

        next();
    };
}

module.exports = {
    requestLogger,
    slowRequestLogger,
};
