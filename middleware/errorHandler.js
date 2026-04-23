const logger = require('../config/logger');

/**
 * Centralized error handler middleware
 */
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    
    logger.error('Request error', {
        statusCode,
        message,
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        ip: req.ip,
        stack: err.stack,
    });
    
    // Avoid exposing internal errors in production
    const responseMessage = process.env.NODE_ENV === 'production' 
        ? 'An error occurred processing your request'
        : message;
    
    return res.status(statusCode).json({
        success: false,
        error: responseMessage,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
}

/**
 * Async error wrapper for Express route handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Custom error class
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    errorHandler,
    asyncHandler,
    AppError,
};
