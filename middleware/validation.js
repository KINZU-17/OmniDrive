const logger = require('../config/logger');

/**
 * Create a middleware factory for validating request bodies
 */
function validateBody(schema) {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.body);
            req.validated = validated;
            next();
        } catch (error) {
            logger.warn('Validation error', {
                path: req.path,
                method: req.method,
                errors: error.errors,
            });
            
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
    };
}

/**
 * Validate query parameters
 */
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.query);
            req.validated = { ...req.validated, ...validated };
            next();
        } catch (error) {
            logger.warn('Query validation error', {
                path: req.path,
                errors: error.errors,
            });
            
            return res.status(400).json({
                success: false,
                error: 'Invalid query parameters',
                details: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
    };
}

/**
 * Validate URL parameters
 */
function validateParams(schema) {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.params);
            req.validated = { ...req.validated, ...validated };
            next();
        } catch (error) {
            logger.warn('Params validation error', {
                path: req.path,
                errors: error.errors,
            });
            
            return res.status(400).json({
                success: false,
                error: 'Invalid URL parameters',
                details: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
    };
}

module.exports = {
    validateBody,
    validateQuery,
    validateParams,
};
