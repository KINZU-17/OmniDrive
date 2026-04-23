/**
 * Normalize API response format across all endpoints
 */
function normalizeResponse(req, res, next) {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
        // Ensure response follows standard format
        if (data && typeof data === 'object') {
            const normalized = {
                success: data.success !== undefined ? data.success : true,
                data: data.data || data,
                error: data.error || null,
                timestamp: new Date().toISOString(),
            };
            
            // Don't duplicate error field if already in data
            if (data.error && !data.data) {
                return originalJson(normalized);
            }
            
            return originalJson(normalized);
        }
        
        return originalJson(data);
    };
    
    next();
}

module.exports = normalizeResponse;
