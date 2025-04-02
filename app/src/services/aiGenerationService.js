/**
 * AI Generation Service
 * 
 * This service handles communication with the OpenAI API through our backend.
 * It's used to generate AI responses to questions about projects.
 */
import { sharedApiService, CATEGORY, PRIORITY } from './sharedApiService';
import logger from '../utils/logger';

// Module-specific logger
const log = logger.getLogger('AIGenerationService');

/**
 * Extracts GitHub repository URL from project data
 * 
 * @param {Object} projectData - Project data object
 * @returns {string|null} - GitHub repository URL or null if not found
 */
function extractGitHubUrl(projectData) {
  if (!projectData) return null;
  
  // Check various fields where GitHub URL might be mentioned
  const fieldsToCheck = [
    'readme',
    'technicalDetails',
    'detailedDescription', 
    'initialDescription'
  ];
  
  // GitHub URL pattern - improved to be more specific
  const githubUrlPattern = /https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+/g;
  
  for (const field of fieldsToCheck) {
    if (projectData[field]) {
      const matches = projectData[field].match(githubUrlPattern);
      if (matches && matches.length > 0) {
        log.debug(`Found GitHub URL in ${field}: ${matches[0]}`);
        return matches[0]; // Return the first GitHub URL found
      }
    }
  }
  
  log.debug('No GitHub URL found in project data');
  return null;
}

/**
 * Creates context for the AI based on project data
 * Separated for better testability and reuse
 * 
 * @param {Object} projectData - Project data
 * @param {string} question - User question
 * @returns {string} - Formatted context
 */
function createAIPrompt(projectData, question) {
  // Extract GitHub repository URL
  const repoUrl = extractGitHubUrl(projectData);
  
  // Base project information
  const baseContext = `
Project: ${projectData.title}
Tech Stack: ${projectData.stack.join(', ')}
Summary: ${projectData.summary || ''}
Basic Description: ${projectData.initialDescription || ''}
${projectData.detailedDescription ? `Detailed Description: ${projectData.detailedDescription}` : ''}
${projectData.technicalDetails ? `Technical Implementation: ${projectData.technicalDetails}` : ''}
${projectData.challenges ? `Challenges & Solutions: ${projectData.challenges}` : ''}
${repoUrl ? `GitHub Repository: ${repoUrl}` : ''}
${projectData.readme ? `Documentation: ${projectData.readme}` : ''}
`;

  // Add UI context if available
  const uiContextStr = projectData.uiContext ? `
Current User Context:
- User is currently viewing: ${projectData.uiContext.activeSection || 'project overview'}
- User interaction state: ${projectData.uiContext.interactionState || 'browsing'}
- Previous questions in this session: ${projectData.uiContext.previousQuestions?.length ? projectData.uiContext.previousQuestions.join(', ') : 'None'}
${projectData.uiContext.scrollPosition ? `- User has scrolled to: ${projectData.uiContext.scrollPosition}` : ''}
${projectData.uiContext.customContext || ''}

When responding, acknowledge the user's current context and tailor your answer to be relevant to what they're currently viewing or interacting with. Be conversational and reference specific details they can see on their screen.
` : '';

  // Combine everything into the final prompt
  return `${baseContext}${projectData.uiContext ? uiContextStr : ''}\n\nQuestion: ${question}`;
}

/**
 * Sends a question about a project to the backend API which uses OpenAI to generate a response
 * 
 * @param {Object} projectData - Data about the project being asked about
 * @param {string} projectData.id - Project identifier
 * @param {string} projectData.title - Project title
 * @param {string} projectData.summary - Brief project summary
 * @param {string[]} projectData.stack - Technologies used in the project
 * @param {string} projectData.initialDescription - Initial project description
 * @param {Object} [projectData.uiContext] - Current UI context information (optional)
 * @param {string} question - The user's question about the project
 * @param {Object} [options] - Additional options
 * @param {number} [options.timeout=30000] - Request timeout in milliseconds
 * @param {boolean} [options.useMock=false] - Whether to use mock implementation
 * @returns {Promise<string>} - The AI-generated response
 */
export async function answerProjectQuestion(projectData, question, options = {}) {
  const { timeout = 30000, useMock = false } = options;
  
  // Use mock implementation if specified or in test environment
  if (useMock || process.env.NODE_ENV === 'test') {
    log.debug('Using mock implementation for project question');
    return mockAnswerProjectQuestion(projectData, question);
  }
  
  // Check for required data
  if (!projectData || !projectData.title || !question) {
    log.error('Missing required project data or question');
    return 'Error: Insufficient information to answer your question.';
  }
  
  log.info(`Processing question for project: ${projectData.title}`);
  
  try {
    // Create the AI prompt
    const prompt = createAIPrompt(projectData, question);
    
    // Measure the length and log it
    const promptLength = prompt.length;
    log.debug(`Prompt length: ${promptLength} characters`);
    
    // Check if prompt is too long and truncate if necessary
    const MAX_PROMPT_LENGTH = 8000;
    const truncatedPrompt = promptLength > MAX_PROMPT_LENGTH 
      ? prompt.substring(0, MAX_PROMPT_LENGTH) + '... [content truncated due to length]'
      : prompt;
    
    if (promptLength > MAX_PROMPT_LENGTH) {
      log.warn(`Prompt truncated from ${promptLength} to ${MAX_PROMPT_LENGTH} characters`);
    }
    
    // Prepare the request body
    const requestBody = {
      question: truncatedPrompt,
      maxTokens: 300,
      temperature: 0.7,
      model: "gpt-4o-mini"
    };
    
    // Create an abort controller for request cancellation
    const abortController = new AbortController();
    
    // Set timeout to abort request if it takes too long
    const timeoutId = setTimeout(() => {
      log.warn(`Request timeout after ${timeout}ms`);
      abortController.abort();
    }, timeout);
    
    try {
      // Call the backend API using the shared service with HIGH priority
      log.debug('Sending request to AI API');
      const startTime = performance.now();
      
      const data = await sharedApiService.enqueueRequest({
        body: requestBody,
        category: CATEGORY.PROJECT_CARDS,
        priority: PRIORITY.HIGH,
        signal: abortController.signal,
        timeout
      });
      
      const duration = Math.round(performance.now() - startTime);
      log.info(`AI response received in ${duration}ms`);
      
      // Cleanup timeout
      clearTimeout(timeoutId);
      
      // Return the answer or a fallback message
      return data.answer || 'Sorry, I could not generate a response at this time.';
    } finally {
      clearTimeout(timeoutId); // Ensure timeout is cleared
    }
  } catch (error) {
    // Handle different error types with specific messages
    if (error.name === 'AbortError') {
      log.warn('Request was aborted', error);
      return 'The request was cancelled or timed out. Please try asking your question again.';
    }
    
    log.error('Error in AI generation service', error);
    
    // Specific error handling based on message
    if (error.message?.includes('Rate limit')) {
      return 'The AI service is currently experiencing high demand. Please try again in a moment.';
    } else if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
      return 'The AI service took too long to respond. Please try again.';
    } else if (error.message?.includes('network') || error.message?.includes('Network')) {
      return 'There was a network issue connecting to the AI service. Please check your connection and try again.';
    }
    
    // Generic error message
    return 'There was a problem connecting to the AI service. Please try again later.';
  }
}

/**
 * Mock implementation for development/testing without making actual API calls
 * 
 * @param {Object} projectData - Project data
 * @param {string} question - User question
 * @returns {Promise<string>} - Mock response
 */
export async function mockAnswerProjectQuestion(projectData, question) {
  log.debug('Using mock AI implementation');
  
  // Simulate network delay (shorter in testing)
  const delay = process.env.NODE_ENV === 'test' ? 100 : 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Generate a more contextual mock response based on available data
  const technologies = projectData.stack ? projectData.stack.join(', ') : 'various technologies';
  const title = projectData.title || 'this project';
  
  // Extract keywords from question for more relevant responses
  const keywords = question.toLowerCase().match(/\b(how|what|why|when|where|who|which|create|build|implement|use|work|function)\b/g);
  
  let response;
  if (keywords && keywords.includes('how')) {
    response = `This is a mock explanation of how ${title} was built. It used ${technologies} with standard development practices.`;
  } else if (keywords && (keywords.includes('what') || keywords.includes('why'))) {
    response = `${title} was created to demonstrate capabilities in ${technologies}. It serves as a showcase of skills and problem-solving approaches.`;
  } else {
    response = `This is a mock response about ${title}. You asked: "${question}". The project used ${technologies} and was designed to solve complex problems in an elegant way.`;
  }
  
  return response;
}
