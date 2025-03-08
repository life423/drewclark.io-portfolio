/**
 * AI Generation Service
 * 
 * This service simulates interaction with an AI model for generating project narratives
 * and answering questions. In a production environment, this would connect to an 
 * actual AI API (like OpenAI, Anthropic, etc.) or a custom fine-tuned model.
 */

// Simple in-memory cache to avoid excessive API calls
const responseCache = {
  narratives: new Map(),
  answers: new Map()
};

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
    Summary: ${projectData.summary}
    Initial story: ${projectData.initialStoryText}
  `;
  
  // In a real implementation, this would be an API call to an LLM
  const response = await simulateApiCall({
    prompt: `Based on this project context: "${context}", 
    please answer this question in a friendly, conversational tone: "${question}"`,
    temperature: 0.6,
    maxTokens: 150
  });
  
  // Cache the response
  responseCache.answers.set(cacheKey, response);
  
  return response;
}

/**
 * Simulates an API call to an LLM service
 * @param {Object} options - API call options
 * @returns {Promise<string>} The simulated response
 */
async function simulateApiCall(options) {
  console.log('Simulating API call with options:', options);
  
  // In development, we'll simulate responses
  // In production, this would be a fetch call to an AI service
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
}
