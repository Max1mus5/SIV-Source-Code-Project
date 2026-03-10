const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

/**
 * Smart rate limiter for authentication endpoints
 * Only counts FAILED attempts, not successful ones
 */

// Store for tracking failed attempts by IP
const failedAttempts = new Map();

// Clean up old entries every hour
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of failedAttempts.entries()) {
        if (now - data.firstAttempt > 60 * 60 * 1000) {
            failedAttempts.delete(key);
        }
    }
}, 60 * 60 * 1000);

/**
 * Middleware to track failed login attempts
 * Only increments counter on failed authentication
 */
function trackFailedLogin(req, res, next) {
    const originalJson = res.json;
    
    res.json = function(data) {
        const ip = req.ip || req.connection.remoteAddress;
        
        // Check if login failed
        const isLoginFailed = (
            data.status === 'error' || 
            data.responseType === 'error' ||
            data.message?.includes('incorrecta') ||
            data.message?.includes('inválido') ||
            data.message?.includes('no encontrado')
        );
        
        const isLoginSuccess = (
            data.status === 'success' || 
            data.responseType === 'success' ||
            data.token
        );
        
        if (isLoginSuccess) {
            // Clear attempts on successful login
            failedAttempts.delete(ip);
            console.log(`✓ Login exitoso desde ${ip} - intentos fallidos reseteados`);
        } else if (isLoginFailed) {
            // Track failed attempt
            const attempt = failedAttempts.get(ip) || { count: 0, firstAttempt: Date.now() };
            attempt.count++;
            attempt.lastAttempt = Date.now();
            failedAttempts.set(ip, attempt);
            console.log(`✗ Login fallido desde ${ip} - intentos: ${attempt.count}`);
        }
        
        return originalJson.call(this, data);
    };
    
    next();
}

/**
 * Middleware to block IPs with too many failed attempts
 */
function blockBruteForce(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const attempt = failedAttempts.get(ip);
    
    if (!attempt) {
        return next();
    }
    
    const timeWindow = 15 * 60 * 1000; // 15 minutes
    const maxFailedAttempts = 10; // 10 failed attempts
    const timeSinceFirst = Date.now() - attempt.firstAttempt;
    
    // Reset if outside time window
    if (timeSinceFirst > timeWindow) {
        failedAttempts.delete(ip);
        return next();
    }
    
    // Block if too many failed attempts
    if (attempt.count >= maxFailedAttempts) {
        const timeRemaining = Math.ceil((timeWindow - timeSinceFirst) / 1000 / 60);
        console.log(`🚫 IP bloqueada por intentos de fuerza bruta: ${ip} - ${attempt.count} intentos fallidos`);
        return res.status(429).json({
            status: 'error',
            code: 'TOO_MANY_FAILED_ATTEMPTS',
            message: `Demasiados intentos fallidos de inicio de sesión. Intente nuevamente en ${timeRemaining} minutos.`,
            retryAfter: timeRemaining
        });
    }
    
    next();
}

/**
 * General rate limiter for login endpoint (very permissive)
 * Allows many requests but prevents abuse
 */
const loginGeneralLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Allow 50 total requests (including successful logins)
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            code: 'TOO_MANY_REQUESTS',
            message: 'Demasiadas peticiones. Por favor, espere unos minutos antes de intentar nuevamente.'
        });
    },
    // Skip successful requests from counting heavily
    skip: (req, res) => {
        // This won't work directly, but the general limit is high enough
        return false;
    }
});

/**
 * Rate limiter for password recovery (stricter but reasonable)
 */
const passwordRecoveryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 recovery attempts per hour
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            code: 'TOO_MANY_RECOVERY_ATTEMPTS',
            message: 'Demasiados intentos de recuperación. Por favor, intente nuevamente en 1 hora.'
        });
    }
});

/**
 * Rate limiter for registration (prevent spam accounts)
 */
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            code: 'TOO_MANY_REGISTRATIONS',
            message: 'Demasiados intentos de registro. Por favor, intente nuevamente en 1 hora.'
        });
    }
});

/**
 * Slow down middleware for general API endpoints
 * Doesn't block, just adds delay
 */
const apiSlowDown = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 100, // Allow 100 requests per window at full speed
    delayMs: (hits) => hits * 100, // Add 100ms delay per request after limit
    maxDelayMs: 5000, // Max 5 second delay
});

module.exports = {
    trackFailedLogin,
    blockBruteForce,
    loginGeneralLimiter,
    passwordRecoveryLimiter,
    registrationLimiter,
    apiSlowDown,
    // Utility to manually clear an IP (for admin use)
    clearFailedAttempts: (ip) => {
        failedAttempts.delete(ip);
        console.log(`✓ Intentos fallidos limpiados para IP: ${ip}`);
    }
};
