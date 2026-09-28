const express = require('express')
const router = express.Router()
const os = require('os')
const path = require('path')
const contactHandler = require('./contact-handler')
const adminAuth = require('./adminAuth')
const { rateLimit } = require('express-rate-limit')
const { updateAllRepositories, processRepository } = require('./services/scheduler/repositoryUpdateService')
const { defaultHandler, projectsHandler } = require('./routes/askGptAdapter')

// AskGPT endpoints using the new modular architecture
router.all('/askGPT', defaultHandler)
router.all('/askGPT/projects', projectsHandler)

// Contact form submission endpoint
router.post('/contact', (req, res) => {
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
        const result = contactHandler.addMessage(name, email, message);
        
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
            error: 'Server error processing contact submission',
            message: error.message
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
router.get('/admin/messages', adminAuth.requireAdmin, (req, res) => {
    try {
        res.status(200).json({ messages: contactHandler.getMessages() });
    } catch (error) {
        console.error('Admin messages error:', error);
        res.status(500).json({ error: 'Server error fetching messages' });
    }
});

router.put('/admin/messages/:id', adminAuth.requireAdmin, (req, res) => {
    try {
        const { read } = req.body || {};
        const success = contactHandler.markMessageRead(req.params.id, read !== false);
        if (!success) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Update message error:', error);
        res.status(500).json({ error: 'Server error updating message' });
    }
});

router.delete('/admin/messages/:id', adminAuth.requireAdmin, (req, res) => {
    try {
        const success = contactHandler.deleteMessage(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Server error deleting message' });
    }
});

// Repository management (long-running jobs, so respond immediately)
router.post('/admin/repositories/update', adminAuth.requireAdmin, (req, res) => {
    console.log('Manually triggering repository update...');
    updateAllRepositories()
        .then(() => console.log('Repository update job completed.'))
        .catch(error => console.error('Error in repository update:', error));
    res.status(200).json({ success: true, message: 'Repository update started. Check server logs for progress.' });
});

router.post('/admin/repositories/process', adminAuth.requireAdmin, (req, res) => {
    const { repositoryUrl } = req.body || {};
    if (!repositoryUrl) {
        return res.status(400).json({ error: 'Missing repository URL' });
    }
    console.log(`Manually processing repository: ${repositoryUrl}`);
    processRepository(repositoryUrl)
        .then(result => console.log(`Repository processing completed: ${result.success ? 'Success' : 'Failed'}`))
        .catch(error => console.error(`Error processing repository ${repositoryUrl}:`, error));
    res.status(200).json({ success: true, message: 'Repository processing started. Check server logs for progress.' });
});

// Import health check routes
const healthRoutes = require('./routes/health');

// Mount health check routes
router.use('/health', healthRoutes);

// Legacy health check endpoint (simple version, kept for backward compatibility)
router.get('/health/legacy', (req, res) => {
    try {
        // Collect basic system info
        const uptime = process.uptime()
        const memoryUsage = process.memoryUsage()
        const nodeVersion = process.version
        const hostname = os.hostname()
        const platform = os.platform()

        // Collected deployment-specific info
        const deploymentInfo = {
            environment: process.env.NODE_ENV || 'development',
            inDocker: process.env.DOCKER_CONTAINER === 'true',
            port: process.env.PORT || '3000',
            apiDirectory: path.resolve(__dirname),
            serverUptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
            startTime: new Date(Date.now() - uptime * 1000).toISOString(),
            currentTime: new Date().toISOString()
        }

        // Response with comprehensive diagnostic information
        res.json({
            status: 'online',
            system: {
                hostname,
                platform,
                nodeVersion,
                memoryMB: {
                    rss: Math.round(memoryUsage.rss / 1024 / 1024),
                    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                    external: Math.round(memoryUsage.external / 1024 / 1024)
                },
                cpus: os.cpus().length
            },
            deployment: deploymentInfo
        })
    } catch (error) {
        // Return error information if anything fails
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving health information',
            error: error.message
        })
    }
})

module.exports = router
