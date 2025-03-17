const express = require('express')
const router = express.Router()
const { handleRequest } = require('./unified-server')

router.all('/askGPT', async (req, res) => {
    // Create adapter functions for unified server
    const createResponse = (status, headers, body) => {
        Object.entries(headers).forEach(([key, value]) => {
            res.setHeader(key, value)
        })
        return res.status(status).json(body)
    }

    const logInfo = message => console.log(`[INFO] ${message}`)
    const logError = message => console.error(`[ERROR] ${message}`)
    const logWarn = message => console.warn(`[WARN] ${message}`)

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
