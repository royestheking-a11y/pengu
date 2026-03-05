import rateLimit from 'express-rate-limit';

/**
 * Auth Rate Limiter
 * Applies to login, register, and Google OAuth endpoints.
 * Limits each IP to 10 requests per 15 minutes.
 * Prevents brute-force attacks on authentication.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,  // Return RateLimit-* headers
    legacyHeaders: false,   // Disable X-RateLimit-* headers
    message: {
        message: 'Too many login attempts from this IP. Please wait 15 minutes before trying again.',
        retryAfter: 900
    },
    handler: (req, res, next, options) => {
        console.warn(`[RateLimit] Auth limit hit for IP: ${req.ip}`);
        res.status(429).json(options.message);
    }
});

/**
 * AI Rate Limiter
 * Applies to all AI-powered endpoints (study tools, companion, career, etc.).
 * Limits each IP to 5 requests per minute.
 * Prevents API quota exhaustion by bots or heavy users.
 */
export const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Pengu AI is busy right now — please wait a moment and try again.',
        retryAfter: 60
    },
    handler: (req, res, next, options) => {
        console.warn(`[RateLimit] AI limit hit for IP: ${req.ip} on ${req.path}`);
        res.status(429).json(options.message);
    }
});
