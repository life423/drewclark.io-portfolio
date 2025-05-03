# Azure OpenAI API Key Configuration Fix

This document explains the changes made to fix the OpenAI API key configuration issue in the Azure Container App deployment.

## Problem

The application was showing "[DEVELOPMENT MODE] OpenAI API key not configured" in the production environment, despite:
1. The key existing in GitHub Secrets as `OPENAI_API_KEY`
2. Being passed to the build process via GitHub Actions
3. Being stored in Azure as an environment variable

## Root Cause Analysis

After examining the codebase, we identified several issues:

1. **GitHub Workflow Conditional Environment Variable Setup**:
   - The API key was being set in Azure Container App only when the initial build failed
   - The key was set as a secret named "openai-api-key" and referenced by the environment variable

2. **Docker Build Configuration**:
   - The Dockerfile wasn't properly passing the OpenAI API key from build arguments to runtime environment

3. **Environment Variable Validation**:
   - There was no diagnostic logging to verify if the API key was being properly loaded in the application

## Changes Made

### 1. GitHub Workflow Update

Modified `.github/workflows/landingpage-AutoDeployTrigger-ea4b4ab4-599d-441e-8b2d-aa04f3ba2814.yml` to:
- Add a dedicated step to set the OpenAI API key in Azure Container App that runs on every deployment
- Ensure consistent naming of the secret as "openai-api-key"

```yaml
# Add environment variables to Container App regardless of build outcome
- name: Set OpenAI API key in Container App
  run: |
    # Add environment variables to Container App (as a secret)
    az containerapp secret set -n landingpage -g portfolio-apps --secrets openai-api-key=${{ secrets.OPENAI_API_KEY }}
    az containerapp update -n landingpage -g portfolio-apps --set-env-vars "OPENAI_API_KEY=secretref:openai-api-key"
```

### 2. Docker Build Configuration

Updated the `Dockerfile` to properly handle the API key:
- Added OpenAI API key as a build argument
- Passed the key from builder stage to runtime stage

```dockerfile
# In builder stage
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

# In runtime stage
ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
```

### 3. Enhanced API Key Validation

Added diagnostic logging in `api/config.js` to verify the API key is properly loaded:

```javascript
// Enhanced environment variable debugging
console.log('Environment variables for OpenAI debugging:')
console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY)
if (process.env.OPENAI_API_KEY) {
    console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY.length)
    console.log('OPENAI_API_KEY format check:', 
        process.env.OPENAI_API_KEY.startsWith('sk-') ? 'Valid format (starts with sk-)' : 'Invalid format')
}
```

### 4. Azure Configuration Verification Script

Created a script (`scripts/verify-azure-config.sh`) that can be used to verify the Azure Container App configuration:
- Checks if the OPENAI_API_KEY environment variable exists
- Validates if it correctly references a secret
- Confirms the referenced secret exists in the Container App

## How to Verify the Fix

### After Deployment

1. Check the container logs in Azure Portal for the diagnostic messages added to `api/config.js`
2. Verify that you no longer see the "[DEVELOPMENT MODE] OpenAI API key not configured" message
3. Test the OpenAI integration functionality in your application

### Using Azure CLI

If you have Azure CLI installed with proper permissions, you can run:

```bash
# On Linux/Mac
./scripts/verify-azure-config.sh

# On Windows (PowerShell)
bash ./scripts/verify-azure-config.sh
```

Or verify manually with:

```bash
# Verify environment variables
az containerapp show -n landingpage -g portfolio-apps --query "properties.template.containers[0].env" -o json

# Verify secrets
az containerapp secret list -n landingpage -g portfolio-apps -o table
```

## Manual Fix (If Needed)

If issues persist, you can manually update the configuration in Azure:

```bash
# Set the secret
az containerapp secret set -n landingpage -g portfolio-apps --secrets openai-api-key=your-actual-api-key-here

# Update the environment variable to reference the secret
az containerapp update -n landingpage -g portfolio-apps --set-env-vars "OPENAI_API_KEY=secretref:openai-api-key"
```
