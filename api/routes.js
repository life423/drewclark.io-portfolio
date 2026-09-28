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

// Contact form submission endpoint
router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // Validate inputs
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        
        // Add the message
        const result = await contactHandler.addMessage(name, email, message);
        
        if (!result) {
            return res.status(500).json({ error: 'Failed to save message' });
        }
        
        // Return success
        res.status(200).json({ 
            success: true, 
            message: 'Contact message saved successfully' 
        });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ 
            error: 'Server error processing contact submission'
        });
    }
});

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
