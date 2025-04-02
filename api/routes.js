const express = require('express')
const router = express.Router()
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

module.exports = router
