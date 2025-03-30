/**
 * AI Generation Service
 * 
 * This service handles communication with the OpenAI API through our backend.
 * It's used to generate AI responses to questions about projects.
 */

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
  
  // GitHub URL pattern
  const githubUrlPattern = /https:\/\/github\.com\/[^\/\s]+\/[^\/\s]+/g;
  
  for (const field of fieldsToCheck) {
    if (projectData[field]) {
      const matches = projectData[field].match(githubUrlPattern);
      if (matches && matches.length > 0) {
        return matches[0]; // Return the first GitHub URL found
      }
    }
  }
  
  return null;
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
 * @param {string} question - The user's question about the project
 * @returns {Promise<string>} - The AI-generated response
 */
export async function answerProjectQuestion(projectData, question) {
  try {
    // Extract GitHub repository URL
    const repoUrl = extractGitHubUrl(projectData);
    
    // Create a comprehensive context from all available project data
    const context = `
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

    // Prepare the request body with the comprehensive context
    const requestBody = {
      question: `${context}\n\nQuestion: ${question}`,
      maxTokens: 250,
      temperature: 0.7
    };
    
    // Call the backend API
    const response = await fetch('/api/askGPT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.answer || 'Sorry, I could not generate a response at this time.';
  } catch (error) {
    console.error('Error in AI generation service:', error);
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
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return `This is a mock response about the ${projectData.title} project. 
  You asked: "${question}"
  
  The project used ${projectData.stack.join(', ')} and was designed to solve 
  complex problems in an elegant way. More specific details would be provided 
  by the actual AI in production.`;
}
