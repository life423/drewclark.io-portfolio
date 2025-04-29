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

// Repository and code embedding systems
const { initializeScheduler } = require('./api/services/scheduler/repositoryUpdateService')

// Set cache TTL based on config
setCacheTTL(config.cacheTtlMs)

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
const helmet = require('helmet');

// Parse JSON with a size limit to prevent JSON bombs
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Add security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for frontend
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Allow inline styles and Google Fonts
            fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow Google Fonts
            imgSrc: ["'self'", "data:", "blob:"], // Allow data URIs for images
            connectSrc: ["'self'", process.env.NODE_ENV === 'development' ? '*' : ''] // More permissive in dev
        }
    }
}));

// Enhanced CORS middleware with proper security
app.use((req, res, next) => {
    // Production domains
    const productionDomains = [
        'https://drewclark.io',
        'https://www.drewclark.io'
    ];
    
    // Development domains (including Vite's default port 5173)
    const developmentDomains = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:5173', 
        'http://127.0.0.1:5173', 
        'http://localhost:5174', 
        'http://127.0.0.1:5174'
    ];
    
    // Determine allowed origins based on environment
    const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? productionDomains 
        : [...productionDomains, ...developmentDomains];
    
    const origin = req.headers.origin;
    
    // Set appropriate CORS headers
    if (origin && allowedOrigins.includes(origin)) {
        // Allow specific origin that's in our whitelist
        res.header('Access-Control-Allow-Origin', origin);
    } else if (process.env.NODE_ENV !== 'production') {
        // In development, be more permissive (but log it)
        console.log(`Non-whitelisted origin request: ${origin || 'Unknown'}`);
        res.header('Access-Control-Allow-Origin', '*');
    } else {
        // In production, don't set the header for non-whitelisted origins
        // This effectively blocks CORS requests from unauthorized domains
    }
    
    // Standard CORS headers
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Correlation-Id'
    );
    
    // Add security headers
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

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

// API routes
app.use('/api', apiRoutes)

// Serve static frontend assets - improve path resolution
app.use(express.static(path.join(__dirname, 'app', 'dist')));
console.log(`Serving static files from: ${path.join(__dirname, 'app', 'dist')}`);

// Catch-all route to serve index.html for client-side routing with environment injection
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'app', 'dist', 'index.html');
    
    // Check if the file exists before serving
    if (require('fs').existsSync(indexPath)) {
        // Read the file so we can modify it
        const fs = require('fs');
        let html = fs.readFileSync(indexPath, 'utf8');
        
        // Create an environment script to inject into the HTML
        const envScript = `
            <script>
                // Inject environment variables into window
                window.ENV_DOCKER_CONTAINER = ${process.env.DOCKER_CONTAINER === 'true' ? 'true' : 'false'};
                window.ENV_NODE_ENV = "${process.env.NODE_ENV || 'development'}";
                window.ENV_DEPLOYED_VERSION = "${process.env.npm_package_version || '1.0.0'}";
                window.ENV_SERVER_PORT = "${process.env.PORT || '3000'}";
                console.log("Server-injected environment:", {
                    ENV_DOCKER_CONTAINER: window.ENV_DOCKER_CONTAINER,
                    ENV_NODE_ENV: window.ENV_NODE_ENV,
                    ENV_DEPLOYED_VERSION: window.ENV_DEPLOYED_VERSION,
                    ENV_SERVER_PORT: window.ENV_SERVER_PORT
                });
            </script>
        `;
        
        // Inject our script before the closing </head> tag
        html = html.replace('</head>', `${envScript}</head>`);
        
        // Send the modified HTML
        res.send(html);
    } else {
        // Fallback to sendFile if the file can't be read or modified
        res.sendFile(indexPath);
    }
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
    console.log('ADMIN_ACCESS_TOKEN:', process.env.ADMIN_ACCESS_TOKEN ? `Configured (${process.env.ADMIN_ACCESS_TOKEN.length} chars)` : 'Missing')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('PORT:', process.env.PORT)
    
    // Initialize the repository update scheduler
    if (process.env.ENABLE_REPOSITORY_SCHEDULER === 'true' || process.env.NODE_ENV === 'production') {
        console.log('Initializing repository update scheduler...')
        initializeScheduler()
        console.log('Repository update scheduler initialized')
    } else {
        console.log('Repository update scheduler disabled. Set ENABLE_REPOSITORY_SCHEDULER=true to enable.')
    }
})
