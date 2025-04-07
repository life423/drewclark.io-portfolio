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
  
  // Ensure response has proper punctuation
  let formattedResponse = response.trim();
  
  // Add period if missing and the text doesn't already end with punctuation
  if (formattedResponse && !formattedResponse.match(/[.!?]$/)) {
    formattedResponse += '.';
  }
  
  return formattedResponse;
}

/**
 * Creates context for the AI based on multiple projects data
 * Used for the unified chat that can discuss any/all projects
 * 
 * @param {Array<Object>} projectsData - Array of project data objects
 * @param {string} question - User question
 * @returns {string} - Formatted context with all projects
 */
function createMultiProjectAIPrompt(projectsData, question) {
  if (!projectsData || !Array.isArray(projectsData) || projectsData.length === 0) {
    log.error('Invalid or empty projectsData array');
    return `Question: ${question}`;
  }

  // Build context for each project
  const projectContexts = projectsData.map((project, index) => {
    const projectNum = index + 1;
    
    return `PROJECT ${projectNum}: ${project.title}
Tech Stack: ${project.stack ? project.stack.join(', ') : 'N/A'}
Summary: ${project.summary || ''}
Basic Description: ${project.initialDescription || ''}
${project.detailedDescription ? `Detailed Description: ${project.detailedDescription}` : ''}
${project.technicalDetails ? `Technical Implementation: ${project.technicalDetails}` : ''}
${project.challenges ? `Challenges & Solutions: ${project.challenges}` : ''}`;
  }).join('\n\n');

  // Instruction prompt for handling multi-project questions
  const instructions = `
You are a knowledgeable AI assistant that can discuss multiple projects at once.
When responding to questions, consider all the projects above and their details.
If a question refers to specific projects by number or name, focus on those projects.
If a question asks for comparisons between projects, highlight similarities and differences.
If the question is general, consider which projects are most relevant to the answer.
Always mention which project(s) you're referring to by number (e.g., "Project 1", "Project 2").
`;

  // Combine everything into the final prompt
  return `${projectContexts}\n\n${instructions}\n\nQuestion: ${question}`;
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
    // Create the multi-project AI prompt
    const prompt = createMultiProjectAIPrompt(projectsData, question);
    
    // Check if prompt is too long and truncate if necessary
    const MAX_PROMPT_LENGTH = 10000; // Increased for multi-project context
    const promptLength = prompt.length;
    log.debug(`Multi-project prompt length: ${promptLength} characters`);
    
    const truncatedPrompt = promptLength > MAX_PROMPT_LENGTH 
      ? prompt.substring(0, MAX_PROMPT_LENGTH) + '... [content truncated due to length]'
      : prompt;
    
    if (promptLength > MAX_PROMPT_LENGTH) {
      log.warn(`Multi-project prompt truncated from ${promptLength} to ${MAX_PROMPT_LENGTH} characters`);
    }
    
    // Prepare the request body - similar to single project
    const requestBody = {
      question: truncatedPrompt,
      maxTokens: 500, // Increased token limit for multi-project responses
      temperature: 0.7,
      model: "gpt-4o-mini"
    };
    
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

// Cache for hero text generation to avoid excessive API calls
const heroTextCache = new Map();

/**
 * Creates a prompt for hero text generation based on user interaction
 * 
 * @param {Object} contextData - Information about user interaction
 * @returns {string} - Formatted prompt for AI
 */
function createHeroTextPrompt(contextData) {
  const { mousePosition, scrollInfo, viewportInfo } = contextData;
  
  // Determine focus areas based on mouse position
  const mouseFocus = mousePosition ? `
The user's cursor is currently in the ${mousePosition.zone} zone of the screen (${mousePosition.x}, ${mousePosition.y}).
` : '';

  // Add scroll context if available
  const scrollContext = scrollInfo ? `
The user is scrolling ${scrollInfo.direction || 'not scrolling'} at ${Math.round(scrollInfo.percent || 0)}% of the page.
` : '';

  // Add viewport visibility context
  const viewportContext = viewportInfo ? `
The hero section is ${viewportInfo.isVisible ? 'visible' : 'not visible'} in the viewport.
` : '';

  // Build the complete prompt
  return `
Generate a single engaging sentence for a software engineer's portfolio hero section that would be dynamically displayed as the user interacts with the page.
${mouseFocus}${scrollContext}${viewportContext}
Focus the content on software engineering, AI, cloud technologies, or web development based on where the user's attention is.
For example, if they're hovering near the top-right, focus on AI and machine learning concepts.
If they're at the bottom of the section looking to scroll down, mention project exploration or innovation.

The text should be:
- Concise (under 100 characters)
- Professional but conversational
- Related to software engineering skills and innovation
- Free of hashtags, emoji, and typical portfolio clichés like "Welcome to my portfolio"

Respond with just the sentence, no additional formatting or explanation.
`;
}

/**
 * Generates contextual hero text based on user interaction
 * 
 * @param {Object} contextData - Information about user interaction
 * @param {Object} contextData.mousePosition - Mouse position info (x, y, zone)
 * @param {Object} contextData.scrollInfo - Scroll position and direction
 * @param {Object} contextData.viewportInfo - Information about visibility
 * @param {Object} [options={}] - Additional options
 * @param {boolean} [options.useMock=false] - Whether to use mock implementation
 * @returns {Promise<string>} - AI-generated contextual text
 */
export async function generateHeroText(contextData, options = {}) {
  const { useMock = false } = options;
  
  // Use mock implementation in test environment or when specified
  if (useMock || process.env.NODE_ENV === 'test') {
    log.debug('Using mock implementation for hero text generation');
    return mockGenerateHeroText(contextData);
  }
  
  try {
    // Create cache key from context data
    // Only use significant values to avoid too many variations
    const cacheKey = `${contextData.mousePosition?.zone || 'no-mouse'}-${
      contextData.scrollInfo?.direction || 'no-scroll'}-${
      Math.floor((contextData.scrollInfo?.percent || 0) / 10)}-${
      contextData.viewportInfo?.isVisible ? 'visible' : 'hidden'
    }`;
    
    // Check cache first
    if (heroTextCache.has(cacheKey)) {
      log.debug(`Hero text cache hit for key: ${cacheKey}`);
      return heroTextCache.get(cacheKey);
    }
    
    // Create the hero text prompt
    const prompt = createHeroTextPrompt(contextData);
    
    // Prepare the request body - using MEDIUM priority since this is UI enhancement
    const requestBody = {
      question: prompt,
      maxTokens: 100, // Small token limit since we only need a short sentence
      temperature: 0.8, // Higher temperature for more variety
      model: "gpt-4o-mini"
    };
    
    // Using shorter timeout since this is not critical functionality
    const timeout = 5000;
    
    // Create an abort controller for request cancellation
    const abortController = new AbortController();
    
    // Set timeout to abort request if it takes too long
    const timeoutId = setTimeout(() => {
      log.warn(`Hero text request timeout after ${timeout}ms`);
      abortController.abort();
    }, timeout);
    
    try {
      // Call the backend API using the shared service with MEDIUM priority
      log.debug('Sending hero text request to AI API');
      const startTime = performance.now();
      
      const data = await sharedApiService.enqueueRequest({
        body: requestBody,
        category: CATEGORY.OTHER, // Use separate category from project chats
        priority: PRIORITY.MEDIUM, // Medium priority as it's not critical
        signal: abortController.signal,
        timeout
      });
      
      const duration = Math.round(performance.now() - startTime);
      log.info(`Hero text response received in ${duration}ms`);
      
      // Cleanup timeout
      clearTimeout(timeoutId);
      
      let response = data.answer || "Building elegant solutions to complex problems";
      
      // Ensure response has proper punctuation
      response = response.trim();
      
      // Add period if missing and the text doesn't already end with punctuation
      if (response && !response.match(/[.!?]$/)) {
        response += '.';
      }
      
      // Cache the response before returning
      heroTextCache.set(cacheKey, response);
      
      // If cache gets too large, remove oldest entries
      if (heroTextCache.size > 50) {
        // Remove oldest entry (simple LRU implementation)
        const oldestKey = heroTextCache.keys().next().value;
        heroTextCache.delete(oldestKey);
      }
      
      return response;
    } finally {
      clearTimeout(timeoutId); // Ensure timeout is cleared
    }
  } catch (error) {
    log.error('Error generating hero text:', error);
    // Return a default fallback in case of error
    return "Crafting innovative solutions at the intersection of design and technology";
  }
}

/**
 * Mock implementation for hero text generation
 * 
 * @param {Object} contextData - Context data for hero text
 * @returns {Promise<string>} - Mock hero text
 */
async function mockGenerateHeroText(contextData) {
  log.debug('Using mock implementation for hero text');
  
  // Simulate network delay (shorter in testing)
  const delay = process.env.NODE_ENV === 'test' ? 50 : 300;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Array of potential responses based on different zones and contexts
  const responses = {
    // Mouse position zones
    'left-top': [
      "Architecting scalable solutions with a focus on user experience",
      "Building ambitious systems that solve real-world problems"
    ],
    'center-top': [
      "Crafting elegant code that brings powerful ideas to life",
      "Developing future-proof applications with best practices at heart"
    ],
    'right-top': [
      "Integrating AI to create intelligent, responsive applications",
      "Leveraging machine learning to deliver transformative experiences"
    ],
    'left-middle': [
      "Bridging design and functionality for seamless user experiences",
      "Blending creativity with technical precision in every project"
    ],
    'center-middle': [
      "Engineering robust solutions to today's complex challenges",
      "Transforming concepts into reality through clean, efficient code"
    ],
    'right-middle': [
      "Optimizing systems for performance, security, and scalability",
      "Fine-tuning cloud infrastructure for maximum reliability"
    ],
    'left-bottom': [
      "Creating responsive, accessible interfaces for all users",
      "Designing intuitive experiences that feel natural and effortless"
    ],
    'center-bottom': [
      "Explore my work and discover innovative approaches to tough problems",
      "See how technical expertise meets creative problem-solving below"
    ],
    'right-bottom': [
      "Check out my projects showcasing full-stack development expertise",
      "Scroll down to view my portfolio of sophisticated solutions"
    ],
    
    // Scroll directions
    'down': [
      "Discovering new possibilities with every line of code written",
      "Continuously pushing the boundaries of what's technically possible"
    ],
    'up': [
      "Revisiting fundamentals with modern approaches and fresh ideas",
      "Strengthening core concepts through practical application"
    ],
    
    // Default responses
    'default': [
      "Translating complex requirements into elegant technical solutions",
      "Building the future one commit at a time",
      "Turning innovative ideas into production-ready applications",
      "Solving tomorrow's problems with today's best practices"
    ]
  };
  
  // Determine which response set to use
  let responseSet;
  if (contextData.mousePosition?.zone) {
    responseSet = responses[contextData.mousePosition.zone];
  }
  
  // If no match by zone or no responses in that zone, try scroll direction
  if (!responseSet && contextData.scrollInfo?.direction) {
    responseSet = responses[contextData.scrollInfo.direction];
  }
  
  // Fall back to default if no match
  if (!responseSet) {
    responseSet = responses.default;
  }
  
  // Pick a random response from the set
  const randomIndex = Math.floor(Math.random() * responseSet.length);
  return responseSet[randomIndex];
}
