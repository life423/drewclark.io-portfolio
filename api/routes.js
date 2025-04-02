const express = require('express')
const router = express.Router()
const os = require('os')
const path = require('path')
const { handleRequest } = require('./unified-server')

// Helper function to create response adapter
const createResponseAdapter = (res) => {
    return (status, headers, body) => {
        Object.entries(headers).forEach(([key, value]) => {
            res.setHeader(key, value)
        })
        return res.status(status).json(body)
    }
}

// Legacy endpoint (for backward compatibility)
router.all('/askGPT', async (req, res) => {
    const createResponse = createResponseAdapter(res)
    const logInfo = message => console.log(`[INFO] ${message}`)
    const logError = message => console.error(`[ERROR] ${message}`)
    const logWarn = message => console.warn(`[WARN] ${message}`)

    // Use default feature
    req.feature = 'default'
    
    // Call the unified handler
    await handleRequest({
        req,
        createResponse,
        logInfo,
        logError,
        logWarn,
    })
})


// Projects-specific endpoint
router.all('/askGPT/projects', async (req, res) => {
    const createResponse = createResponseAdapter(res)
    const logInfo = message => console.log(`[INFO][Projects] ${message}`)
    const logError = message => console.error(`[ERROR][Projects] ${message}`)
    const logWarn = message => console.warn(`[WARN][Projects] ${message}`)

    // Set feature flag for rate limiting
    req.feature = 'projects'
    
    // Call the unified handler
    await handleRequest({
        req,
        createResponse,
        logInfo,
        logError,
        logWarn,
    })
})

// Health check endpoint for diagnosing deployment issues
router.get('/health', (req, res) => {
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
