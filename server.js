/**
 * Main server file for the Drew Clark Portfolio application
 *
 * This file sets up the Express server and serves both the API and frontend application.
 * The API functionality has been modularized into separate files for better maintainability.
 */

const express = require('express')
const path = require('path')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

// Import API routes and utilities
const apiRoutes = require('./api/routes')
const { setCacheTTL } = require('./api/utils')
const config = require('./api/config')

// Set cache TTL based on config
setCacheTTL(config.cacheTtlMs)

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3001 // Changed from 3000 to 3001

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Improved CORS middleware with specific allowed origins
app.use((req, res, next) => {
    // Allow specific origins in development
    const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000']
    const origin = req.headers.origin
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin)
    } else if (process.env.NODE_ENV !== 'production') {
        // In development, fallback to allow all if not matching specific origins
        res.header('Access-Control-Allow-Origin', '*')
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Correlation-Id'
    )
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

// API routes
app.use('/api', apiRoutes)

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'app/dist')))

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'app/dist', 'index.html'))
})

// Start the server - bind to 0.0.0.0 in container environments to allow external connections
const HOST = process.env.DOCKER_CONTAINER ? '0.0.0.0' : 'localhost'
app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(
        `OpenAI API Key: ${config.openAiApiKey ? 'Configured' : 'Missing'}`
    )
})
