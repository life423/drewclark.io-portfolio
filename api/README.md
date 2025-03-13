# Portfolio API

This directory contains the API functionality for Drew Clark's portfolio website, including OpenAI integration.

## API Configuration

The API uses the configuration in `config.js` which centralizes all settings and environment variables in one place.

### OpenAI Integration

The `askGPT/index.js` file provides the OpenAI functionality to answer questions about Drew's portfolio. This requires a valid OpenAI API key to function properly.

## Environment Variables

### Setting Up Your OpenAI API Key

1. **Create an Environment File**:
   ```bash
   # For development
   cp .env.development.template .env.development
   
   # For production (optional)
   cp .env.development.template .env.production
   ```

2. **Edit the File**:
   Open the newly created file and replace `your-openai-api-key-here` with your actual OpenAI API key.

3. **Verification**:
   When the API starts, it will log whether the OpenAI API key is configured properly.

## API Endpoints

### askGPT

- **GET /askGPT**
  - Health check endpoint
  - Returns status and configuration information
  
- **POST /askGPT**
  - Processes questions and returns AI-generated responses
  - Request format:
    ```json
    {
      "question": "Tell me about Drew Clark's portfolio",
      "model": "gpt-3.5-turbo",  // optional
      "temperature": 0.7,        // optional
      "maxTokens": 500           // optional
    }
    ```

## Development Notes

- The config automatically detects whether the code is running in Azure Functions or locally
- Different .env files are loaded based on the NODE_ENV environment variable
- During development, the API will return a mock response if no OpenAI API key is configured
