/**
 * Normalize API response format across all endpoints
 */
function normalizeResponse(req, res, next) {
    const originalJson = res.json.bind(res);

    res.json = function(data) {
        if (data && typeof data === 'object') {
            // Extract known envelope fields
            const { success, data: body, error, pagination, ...rest } = data;

            const normalized = {
                success: success !== undefined ? success : (!error && res.statusCode < 400),
                data: body !== undefined ? body : (error ? undefined : rest),
                timestamp: new Date().toISOString(),
            };

            if (error) normalized.error = error;
            if (pagination) normalized.pagination = pagination;

            return originalJson(normalized);
        }
        return originalJson(data);
    };

    next();
}

module.exports = normalizeResponse;
