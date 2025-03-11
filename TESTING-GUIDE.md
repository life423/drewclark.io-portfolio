# Testing the Azure Function Integration

This guide walks you through the process of testing the Azure Function with OpenAI integration, both locally and in production.

## Local Testing

### Step 1: Install Dependencies

First, make sure all dependencies are installed:

```bash
cd api
npm install
```

### Step 2: Configure Your OpenAI API Key

Edit the `api/local.settings.json` file and replace the placeholder with your actual OpenAI API key:

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "",
    "OPENAI_API_KEY": "sk-your-actual-openai-key-here"
  }
}
```

You can get an API key from the [OpenAI Platform](https://platform.openai.com/api-keys).

**Note:** Your API key appears to be a Project API key (starting with `sk-proj-`), which is the recommended type for production applications. These keys have better security features than standard API keys.

### Step 3: Install Azure Functions Core Tools

If you don't have the Azure Functions Core Tools installed, you can install them:

```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

Verify the installation:

```bash
func --version
```

### Step 4: Start the Function Locally

Run the function locally:

```bash
cd api
func start
```

This will start the Azure Functions runtime, typically at http://localhost:7071.

### Step 5: Test with Requests

You can test your function with:

**PowerShell**:
```powershell
Invoke-RestMethod -Uri "http://localhost:7071/api/askGPT" `
  -Method POST `
  -Body '{"question":"Tell me about your portfolio site"}' `
  -ContentType "application/json"
```

**Browser**:
Visit http://localhost:7071/api/askGPT in your browser to see the health check message (GET request).

### Step 6: Test the React Integration

The application has been configured to test the Azure Function:

1. In development mode, navigate to the bottom of the page to see the "AI Integration Testing" section
2. Type a question in the textarea and click "Test AI Response"
3. You should see a response from the OpenAI API via the Azure Function

If you see "Error: Failed to fetch" or a similar message, check:
- Is your Azure Function running locally?
- Is the URL in `aiGenerationService.js` correctly pointing to your local function?
- Do you have CORS configured correctly?

## Production Deployment

### Step 1: Configure API Key in Azure

Once you're ready to deploy to production:

1. Go to Azure Portal → Your Static Web App
2. Navigate to Configuration → Application settings
3. Add a new setting:
   - Name: `OPENAI_API_KEY`
   - Value: Your actual OpenAI API key
4. Save the changes

### Step 2: Deploy via GitHub

Push your changes to GitHub:

```bash
git add .
git commit -m "Add OpenAI integration via Azure Functions"
git push
```

The GitHub Actions workflow will automatically deploy your updated function to Azure.

### Step 3: Verify Production Deployment

1. Visit your Azure Static Web App URL
2. Check the browser console for any errors
3. If you included the test UI in production, use it to verify the integration

## Troubleshooting

### Common Issues:

1. **CORS Errors**: If you see CORS errors in the console, check that your function's CORS settings allow requests from your frontend's origin.

2. **Function Not Found**: Make sure the function's name in `function.json` matches the folder name (`askGPT`).

3. **OpenAI API Errors**: If you see errors about the OpenAI API, check that your API key is correctly set and has sufficient quota.

4. **Deployment Issues**: Check the GitHub Actions logs for any deployment errors.
