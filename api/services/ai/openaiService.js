/**
 * OpenAI Service
 * 
 * Handles interactions with the OpenAI API, providing a consistent interface
 * for sending requests and processing responses.
 */

const OpenAI = require('openai');
const config = require('../../config');

// Global client instance (singleton)
let openAiClient = null;
let openAiInitError = null;

/**
 * Initialize the OpenAI client if not already initialized
 * @param {string} apiKey - Optional API key to override the config
 * @returns {Object} - Object containing client and any error
 */
function initializeClient(apiKey = null) {
  if (openAiClient) {
    return { client: openAiClient, error: null };
  }
  
  const key = apiKey || config.openAiApiKey;
  
  if (!key) {
    const error = 'OpenAI API key is missing';
    console.error(error);
    openAiInitError = error;
    return { client: null, error };
  }
  
  try {
    openAiClient = new OpenAI({ apiKey: key });
    console.log('OpenAI client initialized successfully');
    return { client: openAiClient, error: null };
  } catch (error) {
    console.error(`Failed to initialize OpenAI client: ${error.message}`);
    openAiInitError = error.message;
    return { client: null, error: error.message };
  }
}

/**
 * Get chat completion from OpenAI API
 * @param {Object} params - Request parameters
 * @param {string} params.model - Model name (e.g., gpt-3.5-turbo)
 * @param {Array} params.messages - Array of message objects (role, content)
 * @param {number} params.temperature - Temperature for sampling
 * @param {number} params.maxTokens - Maximum tokens to generate
 * @param {function} params.logInfo - Optional logging function
 * @param {function} params.logError - Optional error logging function
 * @returns {Promise<Object>} - Response object with answer and metadata
 */
async function getChatCompletion(params) {
  const { 
    model = 'gpt-3.5-turbo', 
    messages,
    temperature = 0.7,
    maxTokens = 500,
    logInfo = console.log,
    logError = console.error
  } = params;
  
  // Get client
  const { client, error } = initializeClient();
  
  if (!client) {
    throw new Error(`OpenAI client not available: ${error}`);
  }
  
  try {
    logInfo(`Calling OpenAI API with model ${model}`);
    const startTime = Date.now();
    
    const response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature
    });
    
    const apiCallDuration = Date.now() - startTime;
    logInfo(`Received successful response from OpenAI API in ${apiCallDuration}ms`);
    
    // Extract answer from response
    const answer = response.choices[0].message.content;
    
    return {
      answer,
      usage: response.usage,
      model: response.model,
      duration: apiCallDuration
    };
  } catch (error) {
    logError(`OpenAI API error: ${error.message}`);
    
    // Categorize common errors for better error handling
    if (error.status === 401) {
      throw new Error(`Authentication error: Invalid API key. Original message: ${error.message}`);
    } else if (error.status === 429) {
      throw new Error(`Rate limit exceeded. Original message: ${error.message}`);
    } else if (error.status === 500) {
      throw new Error(`OpenAI server error. Original message: ${error.message}`);
    } else if (error.status === 400) {
      throw new Error(`Invalid request to OpenAI API. Original message: ${error.message}`);
    } else if (error.name === 'TimeoutError' || (error.message && error.message.includes('timeout'))) {
      throw new Error(`OpenAI API request timed out. Original message: ${error.message}`);
    } else {
      throw new Error(`Unexpected error from OpenAI API: ${error.message}. Error type: ${error.name || 'unknown'}`);
    }
  }
}

/**
 * Check if a model name is allowed
 * @param {string} model - Model name
 * @returns {boolean} - Whether the model is allowed
 */
function isValidModel(model) {
  return config.allowedModels.includes(model);
}

/**
 * Create system prompt based on repository context
 * @param {boolean} usingRepoContext - Whether repository context is available
 * @returns {string} - System prompt
 */
function createSystemPrompt(usingRepoContext) {
  if (usingRepoContext) {
    return "You are a helpful assistant answering questions for Drew Clark's portfolio website visitors. You have been provided with relevant code snippets from the repository to help answer questions about the code. Refer to these code snippets when answering questions about how the code works. Keep responses concise, informative, and friendly.";
  }
  
  return "You are a helpful assistant answering questions for Drew Clark's portfolio website visitors. Keep responses concise, informative, and friendly.";
}

// Initialize the client automatically on module import (non-blocking)
initializeClient();

module.exports = {
  initializeClient,
  getChatCompletion,
  isValidModel,
  createSystemPrompt,
  getInitError: () => openAiInitError
};
