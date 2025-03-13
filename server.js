/**
 * Main server file for the Drew Clark Portfolio application
 * 
 * This file sets up the Express server and serves both the API and frontend application.
 * The API functionality has been modularized into separate files for better maintainability.
 */

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import API routes and utilities
const apiRoutes = require('./api/routes');
const { setCacheTTL } = require('./api/utils');
const config = require('./api/config');

// Set cache TTL based on config
setCacheTTL(config.cacheTtlMs);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Correlation-Id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API routes
app.use('/api', apiRoutes);

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'app/dist')));

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`OpenAI API Key configured: ${!!config.openAiApiKey}`);
  if (config.openAiApiKey) {
    console.log(`OpenAI API Key length: ${config.openAiApiKey.length}`);
  }
});
