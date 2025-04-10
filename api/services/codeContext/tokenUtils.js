/**
 * Token Utility Functions
 * 
 * Provides utilities for estimating tokens and managing context size
 * for OpenAI API requests.
 */

/**
 * Estimate the number of tokens in a text string
 * This is a simple approximation (not exact) based on OpenAI's guidelines
 * @param {string} text - Text to estimate tokens for
 * @returns {number} Estimated token count
 */
function estimateTokens(text) {
  if (!text) return 0;
  
  // OpenAI guidelines suggest ~4 chars per token for English text
  // This is a rough estimate and will vary based on the actual content
  return Math.ceil(text.length / 4);
}

/**
 * Check if the combined token count exceeds a limit
 * @param {string} question - The user's question
 * @param {Array} codeSnippets - Array of code snippets with payloads
 * @param {number} maxTokens - Maximum number of tokens allowed
 * @returns {boolean} True if the combined token count exceeds the limit
 */
function wouldExceedTokenLimit(question, codeSnippets, maxTokens = 3000) {
  // Reserve ~500 tokens for the system prompt and other overhead
  const reservedTokens = 500;
  const availableTokens = maxTokens - reservedTokens;
  
  // Estimate question tokens
  const questionTokens = estimateTokens(question);
  let totalTokens = questionTokens;
  
  // Add estimated tokens for each code snippet
  for (const snippet of codeSnippets) {
    const payload = snippet.payload;
    const headerText = `[X] ${payload.type.toUpperCase()}: ${payload.name}\nFile: ${payload.path}\n`;
    const codeText = "```\n" + payload.content + "\n```\n\n";
    
    totalTokens += estimateTokens(headerText + codeText);
    
    if (totalTokens > availableTokens) {
      return true;
    }
  }
  
  return false;
}

/**
 * Limit code snippets to fit within a token budget
 * @param {Array} snippets - Array of code snippets from search results
 * @param {number} availableTokens - Number of tokens available for code context
 * @returns {Array} Filtered or truncated snippets that fit within token budget
 */
function limitSnippetsToTokenBudget(snippets, availableTokens) {
  if (!snippets || snippets.length === 0) return [];
  
  const limitedSnippets = [];
  let remainingTokens = availableTokens;
  
  for (const snippet of snippets) {
    const payload = snippet.payload;
    
    // Estimate the tokens for this snippet
    const headerText = `[X] ${payload.type.toUpperCase()}: ${payload.name}\nFile: ${payload.path}\n`;
    const codeText = "```\n" + payload.content + "\n```\n\n";
    
    const snippetTokens = estimateTokens(headerText + codeText);
    
    if (snippetTokens <= remainingTokens) {
      // Whole snippet fits
      limitedSnippets.push(snippet);
      remainingTokens -= snippetTokens;
    } else if (limitedSnippets.length === 0) {
      // If we can't fit even one full snippet, truncate it
      const truncateToTokens = Math.max(100, remainingTokens);
      const truncateToChars = truncateToTokens * 4;
      
      const truncatedContent = payload.content.substring(0, truncateToChars) + 
                              "\n// ... (truncated for length)";
      
      const clonedSnippet = JSON.parse(JSON.stringify(snippet)); // Deep clone
      clonedSnippet.payload.content = truncatedContent;
      clonedSnippet.payload.isTruncated = true;
      
      limitedSnippets.push(clonedSnippet);
      break;
    } else {
      // Can't fit more snippets
      break;
    }
  }
  
  return limitedSnippets;
}

module.exports = {
  estimateTokens,
  wouldExceedTokenLimit,
  limitSnippetsToTokenBudget
};
