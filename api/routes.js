const express = require('express')
const router = express.Router()
const contactHandler = require('./contact-handler')
const adminAuth = require('./adminAuth')
const { rateLimit } = require('express-rate-limit')
const config = require('./config')
const { askGptHandler } = require('./routes/askGptAdapter')

// Chat rate limits: per visitor, plus a site-wide daily ceiling so a
// distributed burst can't run up the OpenAI bill. Both reset on restart.
const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: config.chat.limitPerMinute,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many questions. Please wait a minute and try again.' },
})
const chatDailyLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: config.chat.limitPerDay,
    keyGenerator: () => 'site-wide',
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'The chat has reached its daily limit. Please try again tomorrow.' },
})

// Chat
router.all('/askGPT', chatLimiter, chatDailyLimiter, askGptHandler)

// Contact form: 5 messages an hour per visitor plus a site-wide daily ceiling.
// Rejected submissions (validation errors) don't count toward either.
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    skipFailedRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many messages. Please try again in an hour.' },
})
const contactDailyLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 100,
    keyGenerator: () => 'site-wide',
    skipFailedRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'The contact form has reached its daily limit. Please try again tomorrow.' },
})
const CONTACT_FIELD_LIMITS = { name: 100, email: 254, message: 5000 }
const COULD_NOT_SEND = "Sorry, your message couldn't be sent. Please try again in a moment."

router.post('/contact', contactLimiter, contactDailyLimiter, async (req, res) => {
    try {
        const { name, email, message, website } = req.body || {}

        // Honeypot: people never see the website field, so anything in it came from a bot.
        // Reply as if it worked so the bot doesn't learn to skip it.
        if (website) {
            return res.status(200).json({ success: true })
        }

        const fields = { name, email, message }
        for (const [field, value] of Object.entries(fields)) {
            if (typeof value !== 'string' || !value.trim()) {
                return res.status(400).json({ error: 'Please fill in your name, email and message.' })
            }
            if (value.trim().length > CONTACT_FIELD_LIMITS[field]) {
                return res.status(400).json({
                    error: `Your ${field} is too long (the limit is ${CONTACT_FIELD_LIMITS[field]} characters).`,
                })
            }
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ error: 'Please enter a valid email address.' })
        }

        await contactHandler.addMessage(name.trim(), email.trim(), message.trim())
        res.status(200).json({ success: true })
    } catch (error) {
        console.error('Contact submission error:', error)
        res.status(500).json({ error: COULD_NOT_SEND })
    }
})

// ─── Admin (contact inbox) ─────────────────────────────────────────────────
// Password login sets a signed, HttpOnly session cookie scoped to /api/admin.
// Secrets never go in URLs, logs, or responses.

// Counts failed logins only: 5 per 15 minutes per IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

router.post('/admin/login', loginLimiter, (req, res) => {
    if (!adminAuth.isConfigured()) {
        return res.status(503).json({ error: 'Admin login is not configured' });
    }
    const { password } = req.body || {};
    if (!adminAuth.verifyPassword(password)) {
        return res.status(401).json({ error: 'Wrong password' });
    }
    adminAuth.setSessionCookie(res);
    res.status(200).json({ authenticated: true });
});

router.post('/admin/logout', (req, res) => {
    adminAuth.clearSessionCookie(res);
    res.status(200).json({ authenticated: false });
});

router.get('/admin/session', (req, res) => {
    res.status(200).json({ authenticated: adminAuth.isAuthenticated(req) });
});

// Everything below needs a signed-in admin
router.get('/admin/messages', adminAuth.requireAdmin, async (req, res) => {
    try {
        res.status(200).json({ messages: await contactHandler.getMessages() });
    } catch (error) {
        console.error('Admin messages error:', error);
        res.status(500).json({ error: 'Server error fetching messages' });
    }
});

router.put('/admin/messages/:id', adminAuth.requireAdmin, async (req, res) => {
    try {
        const { read } = req.body || {};
        const success = await contactHandler.markMessageRead(req.params.id, read !== false);
        if (!success) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Update message error:', error);
        res.status(500).json({ error: 'Server error updating message' });
    }
});

router.delete('/admin/messages/:id', adminAuth.requireAdmin, async (req, res) => {
    try {
        const success = await contactHandler.deleteMessage(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Server error deleting message' });
    }
});

// Import health check routes
const healthRoutes = require('./routes/health');

// Mount health check routes
router.use('/health', healthRoutes);

module.exports = router
