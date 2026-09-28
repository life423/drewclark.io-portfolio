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
const config = require('./api/config')
const { getDb, isMongoConfigured } = require('./api/db')

// Initialize Express app
const app = express()

// One reverse proxy (the Container Apps ingress) sits in front in production.
// Trusting that hop makes req.ip the real client IP, which rate limiting keys on.
app.set('trust proxy', 1)
const PORT = process.env.PORT || 3000

// Security middleware
const helmet = require('helmet');

// Parse JSON with a size limit to prevent JSON bombs
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Add security headers
app.use(helmet({
    frameguard: { action: 'deny' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for frontend
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Allow inline styles and Google Fonts
            fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow Google Fonts
            imgSrc: ["'self'", "data:", "blob:"], // Allow data URIs for images
            connectSrc: ["'self'"],
        }
    }
}));

// CORS: the site and its API share an origin (and Vite proxies /api in development),
// so browsers need no CORS headers. Another site's pages can only call the API
// from a browser if their origin is listed in CORS_ORIGINS.
app.use((req, res, next) => {
    const origin = req.headers.origin
    if (origin && config.corsOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Vary', 'Origin')
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Content-Type')
    }
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204)
    }
    next()
})

// Request validation middleware
app.use((req, res, next) => {
    // Validate request size
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > 1024 * 1024) { // 1MB limit
        return res.status(413).json({ error: 'Request entity too large' });
    }
    
    // Validate Content-Type for POST requests
    if (req.method === 'POST' && req.headers['content-type'] && 
        !req.headers['content-type'].includes('application/json')) {
        return res.status(415).json({ error: 'Unsupported media type. Use application/json' });
    }
    
    next();
});

// API routes; unknown API paths get a JSON 404 instead of the app's HTML
app.use('/api', apiRoutes)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// The built frontend
const distDir = path.join(__dirname, 'app', 'dist')
app.use(express.static(distDir))

// A missing asset is a 404, not the app's HTML (which the service worker would cache as the asset)
app.use('/assets', (req, res) => res.status(404).end())

// Any other GET is a client-side route: serve the app
app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
})

// Start the server - bind to 0.0.0.0 to allow external connections
const HOST = '0.0.0.0'  // Always bind to all interfaces
app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(
        `OpenAI API Key: ${config.openAiApiKey ? 'Configured' : 'Missing'}`
    )
    
    // Log environment variables for debugging
    console.log('Environment variables:')
    console.log('Admin login:', process.env.ADMIN_PASSWORD ? 'configured' : 'not configured (set ADMIN_PASSWORD)')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('PORT:', process.env.PORT)
    
    // Connect to MongoDB now instead of on the first chat or contact request
    if (isMongoConfigured()) {
        getDb()
            .then(() => console.log('MongoDB connected'))
            .catch(error => console.warn(`MongoDB not reachable yet: ${error.message}`))
    }
})
