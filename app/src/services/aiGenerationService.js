/**
 * AI Generation Service
 * 
 * This service handles communication with the OpenAI API through our backend.
 * It's used to generate AI responses to questions about projects.
 */
import { sharedApiService, CATEGORY, PRIORITY } from './sharedApiService';
import logger from '../utils/logger';
import { config, withEnvironmentInfo } from '../config';

// Module-specific logger
const log = logger.getLogger('AIGenerationService');

// Log environment details on service initialization
log.info('AIGenerationService initialized with environment:', config.environment);

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
    // The server builds the prompt from the site's project data; send just the question
    const requestBody = { question, projectId: projectData.id };
    
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

    if (error.userMessage) {
      return error.userMessage;
    }
    
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
  
  // Ensure response has proper punctuation
  let formattedResponse = response.trim();
  
  // Add period if missing and the text doesn't already end with punctuation
  if (formattedResponse && !formattedResponse.match(/[.!?]$/)) {
    formattedResponse += '.';
  }
  
  return formattedResponse;
}

/**
 * Handles questions that can span multiple projects
 * Used by the unified project chat interface
 * 
 * @param {Array<Object>} projectsData - Array of project data objects
 * @param {string} question - User question about any/all projects
 * @param {Object} [options] - Additional options (same as answerProjectQuestion)
 * @returns {Promise<string>} - AI response that can reference multiple projects
 */
export async function answerMultiProjectQuestion(projectsData, question, options = {}) {
  const { timeout = 30000, useMock = false } = options;
  
  // Use mock implementation if specified or in test environment
  if (useMock || process.env.NODE_ENV === 'test') {
    log.debug('Using mock implementation for multi-project question');
    return mockAnswerMultiProjectQuestion(projectsData, question);
  }
  
  // Check for required data
  if (!projectsData || !Array.isArray(projectsData) || projectsData.length === 0 || !question) {
    log.error('Missing required projects data or question');
    return 'Error: Insufficient information to answer your question about the projects.';
  }
  
  log.info(`Processing multi-project question across ${projectsData.length} projects`);
  
  try {
    // The server builds the prompt from the site's project data; send just the question
    const requestBody = { question };
    
    // Create an abort controller for request cancellation
    const abortController = new AbortController();
    
    // Set timeout to abort request if it takes too long
    const timeoutId = setTimeout(() => {
      log.warn(`Multi-project request timeout after ${timeout}ms`);
      abortController.abort();
    }, timeout);
    
    try {
      // Call the backend API using the shared service with HIGH priority
      log.debug('Sending multi-project request to AI API');
      const startTime = performance.now();
      
      const data = await sharedApiService.enqueueRequest({
        body: requestBody,
        category: CATEGORY.PROJECT_CARDS,
        priority: PRIORITY.HIGH,
        signal: abortController.signal,
        timeout
      });
      
      const duration = Math.round(performance.now() - startTime);
      log.info(`Multi-project AI response received in ${duration}ms`);
      
      // Cleanup timeout
      clearTimeout(timeoutId);
      
      // Return the answer or a fallback message
      return data.answer || 'Sorry, I could not generate a response about the projects at this time.';
    } finally {
      clearTimeout(timeoutId); // Ensure timeout is cleared
    }
  } catch (error) {
    // Handle errors - similar to single project
    if (error.name === 'AbortError') {
      log.warn('Multi-project request was aborted', error);
      return 'The request was cancelled or timed out. Please try asking your question again.';
    }
    
    log.error('Error in multi-project AI generation', error);

    if (error.userMessage) {
      return error.userMessage;
    }
    
    // Generic error message
    return 'There was a problem connecting to the AI service. Please try again later.';
  }
}

/**
 * Mock implementation for multi-project questions
 * 
 * @param {Array<Object>} projectsData - Array of project data
 * @param {string} question - User question
 * @returns {Promise<string>} - Mock response
 */
export async function mockAnswerMultiProjectQuestion(projectsData, question) {
  log.debug('Using mock AI implementation for multi-project question');
  
  // Simulate network delay
  const delay = process.env.NODE_ENV === 'test' ? 100 : 1500;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Check for project-specific references in the question
  const projectReferences = question.match(/project\s*[1-3]|first project|second project|third project/gi) || [];
  
  // Check for comparison keywords
  const isComparison = /compar|vs|versus|different|similar|better|between/i.test(question);
  
  let response;
  if (isComparison) {
    // Handle comparison questions
    const project1 = projectsData[0]?.title || 'Project 1';
    const project2 = projectsData[1]?.title || 'Project 2';
    const tech1 = projectsData[0]?.stack?.join(', ') || 'various technologies';
    const tech2 = projectsData[1]?.stack?.join(', ') || 'various technologies';
    
    response = `Comparing **${project1}** and **${project2}**: 

The first project uses ${tech1}, while the second uses ${tech2}. 

Both projects demonstrate different technical approaches and challenges. Project 1 focuses more on AI and game development aspects, whereas Project 2 emphasizes security and encryption techniques.`;
  } 
  else if (projectReferences.length > 0) {
    // Try to determine which project is being referenced
    let projectIndex = 0;
    if (/project\s*2|second project/i.test(question)) {
      projectIndex = 1;
    } else if (/project\s*3|third project/i.test(question)) {
      projectIndex = 2;
    }
    
    // Get information about the referenced project
    const project = projectsData[projectIndex] || projectsData[0];
    const title = project?.title || `Project ${projectIndex + 1}`;
    const tech = project?.stack?.join(', ') || 'various technologies';
    
    response = `Regarding **${title}** (Project ${projectIndex + 1}):

This project focuses on ${tech}. ${project?.initialDescription || ''}

It's one of three projects in my portfolio, each highlighting different skills and technologies.`;
  } 
  else {
    // General response about all projects
    response = `I can discuss all three portfolio projects:

**Project 1: ${projectsData[0]?.title || 'AI Platform Trainer'}** - Focused on ${projectsData[0]?.stack?.[0] || 'Python'} and game development.

**Project 2: ${projectsData[1]?.title || 'Cryptography Toolkit'}** - Exploring ${projectsData[1]?.stack?.[0] || 'Python'} and security concepts.

**Project 3: ${projectsData[2]?.title || 'Ascend-Avoid'}** - Built with ${projectsData[2]?.stack?.[0] || 'JavaScript'} for web platforms.

What would you like to know about these projects? You can ask about specific projects or how they compare.`;
  }
  
  return response;
}
