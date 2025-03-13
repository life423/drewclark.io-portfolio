# API Troubleshooting Guide

This document provides guidance for troubleshooting issues with the AI API integration in the drewclark.io portfolio website.

## Recent Improvements

The following improvements have been made to address API issues:

1. **Enhanced Environment Detection**:
   - Properly detect Azure Functions environment
   - Set `NODE_ENV` correctly in production
   - Improved logging for environment details

2. **Strengthened Error Handling**:
   - Better OpenAI client initialization
   - More detailed error messages for common OpenAI API issues
   - Enhanced CORS headers for cross-origin support

3. **Added Diagnostic Tools**:
   - Created `/api/apiTest` endpoint for runtime diagnostics
   - Added `test-api.js` script for direct OpenAI API testing
   - Improved GitHub workflow verification

4. **Fixed Client-Side Integration**:
   - Better handling of production domain (drewclark.io)
   - Improved error handling in aiGenerationService.js
   - Added correlation IDs for request tracing

## Common Issues and Solutions

### 1. API Returns 500 Internal Server Error

**Possible Causes:**
- OpenAI API key missing or invalid
- OpenAI API rate limits exceeded
- Model not available to your account

**Troubleshooting Steps:**
1. Check the Azure portal to verify the `OPENAI_API_KEY` environment variable is set
2. Test the API key directly using the `api/test-api.js` script
3. Check for rate limit issues in the Azure Function logs

### 2. CORS Issues (Network Error)

**Possible Causes:**
- Missing CORS headers in the API response
- Client making a request from a domain not allowed by CORS

**Troubleshooting Steps:**
1. Check browser console for CORS errors
2. Verify the CORS headers in the API response
3. Test API directly using curl or Postman

### 3. Environment Configuration Issues

**Possible Causes:**
- `.env.production` files not being picked up
- `NODE_ENV` not set correctly
- Config loading from wrong source

**Troubleshooting Steps:**
1. Check the logs for environment detection
2. Run the `/api/apiTest` endpoint to verify environment
3. Check Azure portal for app settings

## Using the Diagnostic Tools

### 1. `/api/apiTest` Endpoint

This endpoint returns diagnostic information about the API environment, including:
- Environment variables
- Request details
- Azure Function status

Example curl command:
```bash
curl https://www.drewclark.io/api/apiTest
```

### 2. `test-api.js` Script

This script tests OpenAI API connectivity directly:

```bash
# Test with default model (gpt-3.5-turbo)
node api/test-api.js

# Test with specific model
node api/test-api.js gpt-4

# Test with specific environment
node api/test-api.js gpt-3.5-turbo production
```

### 3. GitHub Debug Workflow

A special GitHub workflow has been added to manually test API endpoints:

1. Go to the GitHub repository
2. Navigate to the "Actions" tab
3. Select the "Debug and Test API" workflow
4. Click "Run workflow"

## Azure Configuration Reference

For proper API operation, these environment variables should be set in Azure:

| Variable Name | Purpose | Example |
|--------------|---------|---------|
| NODE_ENV | Runtime environment | "production" |
| OPENAI_API_KEY | OpenAI API authentication | "sk-..." |
| WEBSITE_NODE_DEFAULT_VERSION | Node.js version | "~18" |

## Further Assistance

If you're still experiencing issues:

1. Check the Azure Function logs for detailed error messages
2. Try disabling CORS in development (for testing purposes only)
3. Test the OpenAI API using their official SDK outside your application
4. Consider switching to a different OpenAI model or API version
