const rateLimit = require('express-rate-limit');

function rateLimiter(options) {
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max, 
        standardHeaders: true, 
        legacyHeaders: false, 
        handler: (req, res) => {
            res.status(429).json({ 
                status: 'error', 
                message: 'Demasiadas peticiones desde esta IP, inténtelo de nuevo más tarde' 
            });
        }
    });
}

module.exports = { rateLimiter };