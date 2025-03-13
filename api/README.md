# DrewClark.io Portfolio API

This directory contains the Azure Functions that power the API for the DrewClark.io portfolio site.

## Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (version 18.x or higher)
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#install-the-azure-functions-core-tools) (version 4.x)

To install Azure Functions Core Tools:

```bash
# Using npm
npm install -g azure-functions-core-tools@4

# Or using Chocolatey (Windows)
choco install azure-functions-core-tools
```

### Starting the API

From the root of the API directory, run:

```bash
# Install dependencies
npm install

# Start the function app
npm start

# Or with live reload
npm run watch
```

The API will start on port 7071:
- http://localhost:7071/api/askGPT
- http://localhost:7071/api/apiTest

### Testing OpenAI Integration

You can directly test the OpenAI API integration:

```bash
npm run test-openai
```

## Available Endpoints

### askGPT

Main API for answering questions using OpenAI's GPT models.

- **URL**: `/api/askGPT`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "question": "Your question here",
    "model": "gpt-3.5-turbo",  // Optional
    "temperature": 0.7,        // Optional
    "maxTokens": 500           // Optional
  }
  ```
- **Response**:
  ```json
  {
    "answer": "Response from GPT"
  }
  ```

### apiTest

Diagnostic endpoint that returns information about the API environment.

- **URL**: `/api/apiTest`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "message": "API Test function executed successfully",
    "timestamp": "2025-03-13T05:20:41.594Z",
    "environment": "development",
    "envVars": { /* Environment variables (redacted) */ },
    // Additional diagnostic information
  }
  ```

## Configuration

Environment variables are stored in `local.settings.json` for local development, and are set in the Azure portal for production.

Required variables:
- `OPENAI_API_KEY`: Your OpenAI API key

## Troubleshooting

If you encounter issues, refer to the `API-TROUBLESHOOTING.md` file in the root directory for detailed diagnostic procedures.
