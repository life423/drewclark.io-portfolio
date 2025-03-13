#!/usr/bin/env node
/**
 * OpenAI API Test Script
 * 
 * This script tests the OpenAI API directly to verify that your 
 * API key works and the API is accessible.
 * 
 * Usage:
 *   node test-api.js [model] [environment]
 * 
 * Examples:
 *   node test-api.js
 *   node test-api.js gpt-4
 *   node test-api.js gpt-3.5-turbo production
 */

const { OpenAI } = require('openai');
const config = require('./config');

// Get command line arguments
const model = process.argv[2] || 'gpt-3.5-turbo';
const environment = process.argv[3] || process.env.NODE_ENV || 'development';

// Set environment for config
process.env.NODE_ENV = environment;

async function main() {
  console.log('OpenAI API Test Script');
  console.log('=====================');
  console.log(`Environment: ${environment}`);
  console.log(`Node version: ${process.version}`);
  console.log('Checking configuration...');

  // Check if we have an OpenAI API key
  const apiKey = config.openAiApiKey;
  if (!apiKey) {
    console.error('ERROR: OpenAI API key is missing!');
    console.error('Please set OPENAI_API_KEY in your environment variables or .env file.');
    process.exit(1);
  }

  console.log(`OpenAI API key found (${apiKey.length} characters)`);
  console.log(`Testing with model: ${model}`);
  
  try {
    // Initialize OpenAI client
    console.log('Initializing OpenAI client...');
    const openai = new OpenAI({ apiKey });
    
    // Make a simple test API call
    console.log('Sending test request to OpenAI API...');
    console.time('OpenAI API call');
    
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a test assistant. Keep responses very brief.',
        },
        {
          role: 'user',
          content: 'Respond with "API test successful!" if you receive this message.',
        },
      ],
      max_tokens: 20,
      temperature: 0.5,
    });
    
    console.timeEnd('OpenAI API call');
    
    // Check response
    const answer = response.choices[0].message.content.trim();
    console.log('\nAPI Response:');
    console.log(answer);
    
    // Provide usage information
    if (response.usage) {
      console.log('\nToken Usage:');
      console.log(`- Prompt tokens: ${response.usage.prompt_tokens}`);
      console.log(`- Completion tokens: ${response.usage.completion_tokens}`);
      console.log(`- Total tokens: ${response.usage.total_tokens}`);
    }
    
    console.log('\nAPI test completed successfully!');
    
    // Additional model information
    console.log('\nAvailable models (configs):');
    config.allowedModels.forEach(m => console.log(`- ${m}`));
    
  } catch (error) {
    console.error('\nERROR during API test:');
    console.error(`Name: ${error.name}`);
    console.error(`Message: ${error.message}`);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.error('\nStack trace:');
    console.error(error.stack);
    
    console.error('\nTroubleshooting tips:');
    console.error('1. Verify your OPENAI_API_KEY is correct');
    console.error('2. Check if you have access to the requested model');
    console.error('3. Ensure you have sufficient credits/quota');
    console.error('4. Check your network connectivity to the OpenAI API');
    
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
