/**
 * Health Check API Routes
 * 
 * Provides detailed health status for various system components.
 */
const express = require('express');
const router = express.Router();
const qdrantService = require('../services/vectorDb/qdrantService');
const config = require('../config');

/**
 * @api {get} /api/health System health status
 * @apiName GetHealth
 * @apiGroup Health
 * @apiDescription Get detailed health status of all system components
 * 
 * @apiSuccess {Boolean} success Whether the health check request was successful
 * @apiSuccess {Object} system System-level health information
 * @apiSuccess {Object} components Health status of individual components
 */
router.get('/', async (req, res) => {
  try {
    // Get start time for response time calculation
    const startTime = process.hrtime();
    
    // Build system-level health info
    const health = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      components: {
        api: {
          status: 'healthy',
          version: process.env.npm_package_version || '1.0.0'
        }
      }
    };
    
    // Check database component health
    try {
      const vectorDbHealth = await qdrantService.checkHealth();
      health.components.vectorDb = {
        status: vectorDbHealth.isHealthy ? 'healthy' : 'unhealthy',
        connectionMode: vectorDbHealth.connectionStatus,
        collections: vectorDbHealth.collections,
        error: vectorDbHealth.error
      };
      
      if (!vectorDbHealth.isHealthy) {
        health.success = false;
      }
    } catch (error) {
      health.components.vectorDb = {
        status: 'unhealthy',
        error: error.message
      };
      health.success = false;
    }
    
    // Check OpenAI API health
    health.components.openai = {
      status: config.openAiApiKey ? 'configured' : 'unconfigured',
      model: config.openAiModel || 'unspecified',
      embeddingModel: config.vectorDb?.embeddingModel || 'unspecified'
    };
    
    // Calculate response time
    const hrend = process.hrtime(startTime);
    health.responseTime = (hrend[0] * 1000 + hrend[1] / 1000000).toFixed(2) + 'ms';
    
    // Return health information
    res.json(health);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @api {get} /api/health/vector Vector database health status
 * @apiName GetVectorHealth
 * @apiGroup Health
 * @apiDescription Get detailed health status of the vector database component
 */
router.get('/vector', async (req, res) => {
  try {
    const vectorHealth = await qdrantService.checkHealth();
    
    res.json({
      success: vectorHealth.isHealthy,
      status: vectorHealth.isHealthy ? 'healthy' : 'unhealthy',
      connectionMode: vectorHealth.connectionStatus,
      collections: vectorHealth.collections,
      error: vectorHealth.error
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
