/**
 * Admin authentication
 *
 * Password login -> signed, HttpOnly session cookie scoped to /api/admin.
 * The password and session values never go in URLs, logs, or response bodies.
 * Set ADMIN_PASSWORD in the environment to enable the admin panel.
 */
const crypto = require('crypto');

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function getPassword() {
    const pw = process.env.ADMIN_PASSWORD;
    return typeof pw === 'string' && pw.length > 0 ? pw : null;
}

function isConfigured() {
    return getPassword() !== null;
}

// Constant-time string comparison (hashing first makes the lengths match)
function safeEqual(a, b) {
    const ha = crypto.createHash('sha256').update(String(a)).digest();
    const hb = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
}

function verifyPassword(candidate) {
    const expected = getPassword();
    if (!expected || typeof candidate !== 'string' || candidate.length === 0) {
        return false;
    }
    return safeEqual(candidate, expected);
}

// Derived from the password, so changing the password signs everyone out
function signingKey() {
    return crypto.createHash('sha256').update(`admin-session:${getPassword()}`).digest();
}

function sign(expires) {
    return crypto.createHmac('sha256', signingKey()).update(String(expires)).digest('base64url');
}

function createSessionValue() {
    const expires = Date.now() + SESSION_TTL_MS;
    return `${expires}.${sign(expires)}`;
}

function isValidSession(value) {
    if (!isConfigured() || typeof value !== 'string') {
        return false;
    }
    const [expires, signature] = value.split('.');
    if (!expires || !signature || !/^\d+$/.test(expires) || Number(expires) < Date.now()) {
        return false;
    }
    return safeEqual(signature, sign(expires));
}

function readCookie(req, name) {
    const header = req.headers.cookie || '';
    for (const part of header.split(';')) {
        const eq = part.indexOf('=');
        if (eq !== -1 && part.slice(0, eq).trim() === name) {
            return decodeURIComponent(part.slice(eq + 1).trim());
        }
    }
    return null;
}

function cookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/admin',
    };
}

function setSessionCookie(res) {
    res.cookie(COOKIE_NAME, createSessionValue(), { ...cookieOptions(), maxAge: SESSION_TTL_MS });
}

function clearSessionCookie(res) {
    res.clearCookie(COOKIE_NAME, cookieOptions());
}

function isAuthenticated(req) {
    return isValidSession(readCookie(req, COOKIE_NAME));
}

// Express middleware for routes that need a signed-in admin
function requireAdmin(req, res, next) {
    if (!isAuthenticated(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

module.exports = {
    isConfigured,
    verifyPassword,
    setSessionCookie,
    clearSessionCookie,
    isAuthenticated,
    requireAdmin,
};
