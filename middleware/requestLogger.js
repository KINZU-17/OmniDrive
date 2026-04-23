const logger = require('../config/logger');

/**
 * HTTP request logging middleware
 */
function requestLogger(req, res, next) {
    const startTime = Date.now();
    
    // Capture response finish to log timing
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
        
        logger[logLevel](`${req.method} ${req.path}`, {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.user?.id,
        });
    });
    
    next();
}

module.exports = requestLogger;
