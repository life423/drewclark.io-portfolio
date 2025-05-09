const express = require('express')
const router = express.Router()
const os = require('os')
const path = require('path')
const contactHandler = require('./contact-handler')
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

// Admin routes for managing contact messages
router.get('/admin/messages', (req, res) => {
    try {
        const { token } = req.query;
        
        // Verify admin token
        if (!contactHandler.verifyAdminToken(token)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // Get all messages
        const messages = contactHandler.getMessages();
        
        // Return messages
        res.status(200).json({ messages });
    } catch (error) {
        console.error('Admin messages error:', error);
        res.status(500).json({ 
            error: 'Server error fetching messages',
            message: error.message
        });
    }
});

// Mark message as read
router.put('/admin/messages/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { token, read } = req.body;
        
        // Verify admin token
        if (!contactHandler.verifyAdminToken(token)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // Mark message as read/unread
        const success = contactHandler.markMessageRead(id, read !== false);
        
        if (!success) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        // Return success
        res.status(200).json({ 
            success: true, 
            message: 'Message updated successfully' 
        });
    } catch (error) {
        console.error('Update message error:', error);
        res.status(500).json({ 
            error: 'Server error updating message',
            message: error.message
        });
    }
});

// Delete message
router.delete('/admin/messages/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { token } = req.query;
        
        // Verify admin token
        if (!contactHandler.verifyAdminToken(token)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // Delete message
        const success = contactHandler.deleteMessage(id);
        
        if (!success) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        // Return success
        res.status(200).json({ 
            success: true, 
            message: 'Message deleted successfully' 
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ 
            error: 'Server error deleting message',
            message: error.message
        });
    }
});

// Admin token generation (development only)
router.get('/admin/generate-token', (req, res) => {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Endpoint not available in production' });
    }
    
    const token = contactHandler.generateAdminToken();
    
    res.status(200).json({ 
        message: 'Store this token securely and add it to your environment variables as ADMIN_ACCESS_TOKEN',
        token
    });
});

// Repository management endpoints
router.post('/admin/repositories/update', async (req, res) => {
    try {
        const { token } = req.body;
        
        // Verify admin token
        if (!contactHandler.verifyAdminToken(token)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        console.log('Manually triggering repository update...');
        
        // Start the update process
        updateAllRepositories()
            .then(results => {
                console.log('Repository update job completed.');
            })
            .catch(error => {
                console.error('Error in repository update:', error);
            });
        
        // Return immediate success since this is a long-running operation
        res.status(200).json({ 
            success: true, 
            message: 'Repository update job started. Check server logs for progress.'
        });
    } catch (error) {
        console.error('Repository update error:', error);
        res.status(500).json({ 
            error: 'Server error updating repositories',
            message: error.message
        });
    }
});

// Process a specific repository
router.post('/admin/repositories/process', async (req, res) => {
    try {
        const { token, repositoryUrl } = req.body;
        
        // Validate input
        if (!repositoryUrl) {
            return res.status(400).json({ error: 'Missing repository URL' });
        }
        
        // Verify admin token
        if (!contactHandler.verifyAdminToken(token)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        console.log(`Manually processing repository: ${repositoryUrl}`);
        
        // Process the specified repository
        processRepository(repositoryUrl)
            .then(result => {
                console.log(`Repository processing completed: ${result.success ? 'Success' : 'Failed'}`);
            })
            .catch(error => {
                console.error(`Error processing repository ${repositoryUrl}:`, error);
            });
        
        // Return immediate success since this is a long-running operation
        res.status(200).json({ 
            success: true, 
            message: `Processing of repository ${repositoryUrl} started. Check server logs for progress.`
        });
    } catch (error) {
        console.error('Repository processing error:', error);
        res.status(500).json({ 
            error: 'Server error processing repository',
            message: error.message
        });
    }
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
