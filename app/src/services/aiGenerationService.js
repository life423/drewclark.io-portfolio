/**
 * AI Generation Service
 * 
 * This service provides interaction with AI models for generating project narratives
 * and answering questions. It can use both simulated responses for development
 * and real API calls to our Azure Function in production.
 */

// Simple in-memory cache to avoid excessive API calls
const responseCache = {
  narratives: new Map(),
  answers: new Map(),
  generalQuestions: new Map()
};

// Environment configuration
// Always use real APronment-specific URL from Vite env vars
const USE_REAL_API = true;
// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;
// Log environment info for debugging
console.log(`App Environment: ${import.meta.env.MODE}`);
console.log(`API URL: ${API_URL}`);

/**
 * Generates a narrative for a project
 * @param {Object} projectData - Data about the project
 * @param {string} style - Narrative style ('technical', 'storytelling', 'casual')
 * @returns {Promise<string>} The generated narrative
 */
export async function generateProjectNarrative(projectData, style = 'storytelling') {
  const cacheKey = `${projectData.id}_${style}`;
  
  // Check cache first
  if (responseCache.narratives.has(cacheKey)) {
    console.log('Using cached narrative');
    return responseCache.narratives.get(cacheKey);
  }
  
  // In a real implementation, this would be an API call to an LLM
  const response = await simulateApiCall({
    prompt: `Create a ${style} narrative about a project called "${projectData.title}" 
    that uses technologies: ${projectData.stack.join(', ')}. 
    The narrative should highlight challenges and solutions.`,
    temperature: style === 'technical' ? 0.3 : 0.7,
    maxTokens: 300
  });
  
  // Cache the response
  responseCache.narratives.set(cacheKey, response);
  
  return response;
}

/**
 * Answers a user question about a project
 * @param {Object} projectData - Data about the project
 * @param {string} question - The user's question
 * @returns {Promise<string>} The AI-generated answer
 */
export async function answerProjectQuestion(projectData, question) {
  const cacheKey = `${projectData.id}_${question.toLowerCase().trim()}`;
  
  // Check cache first
  if (responseCache.answers.has(cacheKey)) {
    console.log('Using cached answer');
    return responseCache.answers.get(cacheKey);
  }
  
  // Build a context for the AI that includes project details
  const context = `
    Project: ${projectData.title}
    Technologies: ${projectData.stack.join(', ')}
    Summary: ${projectData.summary || 'Not provided'}
    Initial story: ${projectData.initialStoryText || 'Not provided'}
  `;
  
  let response;
  if (USE_REAL_API) {
    try {
      console.log('Calling API for project question:', question);
      console.log('Project context:', context);
      
      // Create a question with context
      const questionWithContext = `Based on this project context: "${context}", 
      please answer this question in a friendly, conversational tone: "${question}"`;
      
      // Call the real API
      response = await callAskGptFunction(questionWithContext);
    } catch (error) {
      console.error('Error calling askGPT function for project question:', error);
      // Fallback to simulation if API call fails
      response = "Sorry, I couldn't connect to the AI service. Please try again later.";
    }
  } else {
    // Use simulation for development
    response = await simulateApiCall({
      prompt: `Based on this project context: "${context}", 
      please answer this question in a friendly, conversational tone: "${question}"`,
      temperature: 0.6,
      maxTokens: 150
    });
  }
  
  // Cache the response
  responseCache.answers.set(cacheKey, response);
  
  return response;
}

/**
 * Ask a general question to the AI (using the Azure Function)
 * @param {string} question - The user's question
 * @returns {Promise<string>} The AI-generated answer
 */
export async function askGeneralQuestion(question) {
  const questionText = question.trim();
  const cacheKey = questionText.toLowerCase();
  
  // Check cache first
  if (responseCache.generalQuestions.has(cacheKey)) {
    console.log('Using cached general answer');
    return responseCache.generalQuestions.get(cacheKey);
  }
  
  let response;
  if (USE_REAL_API) {
    try {
      response = await callAskGptFunction(questionText);
    } catch (error) {
      console.error('Error calling askGPT function:', error);
      // Fallback to simulation if API call fails
      response = "Sorry, I couldn't connect to the AI service. Please try again later.";
    }
  } else {
    // Use simulation for development
    response = await simulateApiCall({
      prompt: `Please answer this question in a friendly, conversational tone: "${question}"`,
      temperature: 0.6,
      maxTokens: 150
    });
  }
  
  // Cache the response
  responseCache.generalQuestions.set(cacheKey, response);
  
  return response;
}

/**
 * Makes an actual API call to the askGPT Azure Function
 * @param {string} question - The question to ask
 * @returns {Promise<string>} The AI response
 */
async function callAskGptFunction(question) {
  try {
    console.log('Calling API at URL:', API_URL);
    console.log('With question:', question);
    
    // Detailed request logging
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    };
    
    console.log('Request details:', request);
    
    const response = await fetch(API_URL, request);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    return data.answer;
  } catch (error) {
    console.error('Error calling askGPT API:', error);
    throw error;
  }
}

/**
 * Simulates an API call to an LLM service or makes a real call based on configuration
 * @param {Object} options - API call options
 * @returns {Promise<string>} The response
 */
async function simulateApiCall(options) {
  console.log('API call with options:', options);
  
  // In development, we'll simulate responses
  // In production, we could use the askGPT function, but we're keeping this
  // separate from askGeneralQuestion for more specific project-related prompts
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate different responses based on the prompt content
      let response = '';
      
      if (options.prompt.includes('narrative') || options.prompt.includes('story')) {
        response = generateSimulatedStory(options.prompt);
      } else if (options.prompt.includes('question')) {
        response = generateSimulatedAnswer(options.prompt);
      } else {
        response = "I'm not sure how to respond to that prompt.";
      }
      
      resolve(response);
    }, 1500); // Simulate network delay
  });
}

/**
 * Generates a simulated story based on prompt keywords
 * @param {string} prompt - The original prompt
 * @returns {string} A simulated narrative
 */
function generateSimulatedStory(prompt) {
  if (prompt.includes('technical')) {
    return "This project implemented a microservices architecture to solve the core scalability challenges. By decomposing the monolithic application into independent services, we achieved better fault isolation and could scale individual components as needed. Each service communicated via REST APIs and used event-driven patterns for asynchronous processing.";
  } else {
    return "The journey began with a significant challenge: users were experiencing frustrating delays when interacting with the dashboard. Diving deep into the performance bottlenecks, I discovered that the real-time data processing was creating unnecessary database load. By implementing a clever caching strategy and optimizing the WebSocket communication, we reduced response times by 78% while handling even more concurrent users.";
  }
}

/**
 * Generates a simulated answer based on question keywords
 * @param {string} prompt - The original prompt containing the question
 * @returns {string} A simulated answer
 */
function generateSimulatedAnswer(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('challenges') || lowerPrompt.includes('difficult')) {
    return "The biggest challenge was definitely optimizing the data visualization components to handle real-time updates without causing browser performance issues. I solved this by implementing a virtual DOM-based rendering approach that only updated the DOM elements that actually changed, rather than re-rendering the entire visualization.";
  } 
  else if (lowerPrompt.includes('technology') || lowerPrompt.includes('stack') || lowerPrompt.includes('tools')) {
    return "For this project, I chose React for the frontend because of its efficient rendering and component-based architecture. The backend used Node.js with Express for the API layer and Socket.IO for real-time communication. Data was stored in MongoDB for flexibility, with Redis handling caching for performance optimization.";
  }
  else if (lowerPrompt.includes('learn') || lowerPrompt.includes('takeaway')) {
    return "The most valuable lesson from this project was the importance of early performance testing. By identifying bottlenecks before they became critical issues, we were able to architect solutions that scaled well from the beginning, rather than having to refactor later.";
  }
  else {
    return "That's an interesting question about the project. The approach involved careful planning and execution, with particular attention to user experience and performance considerations throughout the development lifecycle.";
  }
}

/**
 * Clears the cache (useful for testing or forcing fresh responses)
 */
export function clearAiResponseCache() {
  responseCache.narratives.clear();
  responseCache.answers.clear();
  responseCache.generalQuestions.clear();
}
