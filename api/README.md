# Azure Functions API for drewclark.io Portfolio

This directory contains Azure Functions that power the backend API for the drewclark.io portfolio website.

## Functions

### askGPT

An AI-powered endpoint that processes questions and returns responses using OpenAI's GPT models.

**Endpoint:** `/api/askGPT`  
**Methods:** POST, GET (health check), OPTIONS (CORS preflight)  
**Input Format:** JSON with a `question` field  
**Output Format:** JSON with an `answer` field

Example request:
```json
{
  "question": "What technologies did you use in your portfolio website?"
}
```

Example response:
```json
{
  "answer": "For my portfolio website, I used React with Tailwind CSS for the frontend, and Azure Functions with Node.js for the backend API integration with OpenAI."
}
```

## Setup Instructions

### Local Development

1. Install dependencies:
   ```bash
   cd api
   npm install
   ```

2. Configure your OpenAI API key:
   - Edit `local.settings.json` and replace `your-api-key-here` with your actual OpenAI API key
   - This file is git-ignored to prevent committing secrets

3. Install Azure Functions Core Tools (if not already installed):
   ```bash
   npm install -g azure-functions-core-tools@4 --unsafe-perm true
   ```

4. Run the function locally:
   ```bash
   func start
   ```

5. Test with PowerShell:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:7071/api/askGPT" `
     -Method POST `
     -Body '{"question":"Test question?"}' `
     -ContentType "application/json"
   ```

### Production Deployment

For production, configure the OpenAI API key in the Azure Portal:

1. In the Azure Portal, navigate to your Static Web App
2. Go to "Configuration" → "Application settings"
3. Add a new setting:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

## Folder Structure

```
api/
 ├─ askGPT/
 │   ├─ function.json    # Function definition and bindings
 │   └─ index.js         # Function implementation
 ├─ host.json            # Functions host configuration
 ├─ package.json         # Dependencies and project info
 └─ local.settings.json  # Local environment variables (not committed)
```

## Development Notes

- The function uses a fallback mock response when the OpenAI API key is not configured
- For local development, you can manually test with Invoke-RestMethod or other API tools
- CORS is configured to allow requests from any origin for development ease
