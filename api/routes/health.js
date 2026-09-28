/**
 * Health check routes
 */
const express = require('express');
const router = express.Router();
const config = require('../config');

/**
 * GET /api/health: overall status, for uptime checks
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    components: {
      api: { status: 'healthy' },
      openai: {
        status: config.openAiApiKey ? 'configured' : 'unconfigured',
        model: config.chat.model
      },
      codeIndex: {
        status: config.codeIndex.enabled ? 'configured' : 'unconfigured',
        embeddingModel: config.codeIndex.embeddingModel
      }
    }
  });
});

module.exports = router;
