/**
 * Embedding Service
 * 
 * Handles generation of vector embeddings for code, documentation, and other text
 * using OpenAI's embedding API.
 */
const { OpenAI } = require('openai');
const config = require('../../config');

// Flag to indicate whether we're using a mock implementation
let useMock = false;

// Initialize OpenAI client
let openaiClient;
try {
  if (config.openAiApiKey) {
    openaiClient = new OpenAI({ apiKey: config.openAiApiKey });
    console.log('OpenAI client initialized for embeddings');
  } else {
    console.warn('No OpenAI API key provided, using mock implementation for embeddings');
    useMock = true;
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error.message);
  useMock = true;
}

/**
 * Generate embedding vector for text
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<number[]>} Embedding vector
 */
async function generateEmbedding(text) {
  try {
    // Use mock implementation if no API key or in test mode
    if (useMock || process.env.NODE_ENV === 'test') {
      return mockGenerateEmbedding(text);
    }

    if (!openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    // Ensure text is not too long
    const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;
    
    // Call OpenAI embeddings API
    const response = await openaiClient.embeddings.create({
      model: config.vectorDb.embeddingModel,
      input: truncatedText
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fall back to mock in case of error
    return mockGenerateEmbedding(text);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {string[]} texts - Array of texts to generate embeddings for
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
async function generateEmbeddingsBatch(texts) {
  try {
    // Use mock implementation if no API key or in test mode
    if (useMock || process.env.NODE_ENV === 'test') {
      return Promise.all(texts.map(text => mockGenerateEmbedding(text)));
    }

    if (!openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }

    // Truncate any texts that are too long
    const truncatedTexts = texts.map(text => 
      text.length > 8000 ? text.substring(0, 8000) : text
    );
    
    // Call OpenAI embeddings API with batch
    const response = await openaiClient.embeddings.create({
      model: config.vectorDb.embeddingModel,
      input: truncatedTexts
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    // Fall back to mock in case of error
    return Promise.all(texts.map(text => mockGenerateEmbedding(text)));
  }
}

/**
 * Process code chunks and generate embeddings
 * @param {Array} chunks - Code chunks to embed
 * @param {Object} repoInfo - Repository information
 * @param {string} repoInfo.owner - Repository owner
 * @param {string} repoInfo.repo - Repository name
 * @returns {Promise<Array>} Chunks with embeddings
 */
async function processCodeChunksWithEmbeddings(chunks, repoInfo) {
  try {
    if (!Array.isArray(chunks) || chunks.length === 0) {
      console.warn('No chunks provided for embedding');
      return [];
    }

    const { owner, repo } = repoInfo;
    
    console.log(`Processing ${chunks.length} chunks for embeddings from ${owner}/${repo}`);
    
    // Extract texts for batched embedding
    const texts = chunks.map(chunk => chunk.content);
    
    // Generate embeddings in batch
    const embeddings = await generateEmbeddingsBatch(texts);
    
    // Combine chunks with their embeddings
    const chunksWithEmbeddings = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index],
      metadata: {
        owner,
        repo,
        type: chunk.type || 'code',
        path: chunk.path,
        name: chunk.name,
        importance: chunk.importance || 1
      }
    }));
    
    console.log(`Successfully generated embeddings for ${chunksWithEmbeddings.length} chunks`);
    
    return chunksWithEmbeddings;
  } catch (error) {
    console.error('Error processing code chunks with embeddings:', error);
    return [];
  }
}

/**
 * Generate a mock embedding for development/testing
 * @param {string} text - Input text 
 * @returns {number[]} Mock embedding vector
 */
function mockGenerateEmbedding(text) {
  // Create a deterministic but somewhat varied embedding from text
  // This isn't semantically meaningful, but will be consistent for the same input
  const DIMENSIONS = 1536; // Same as OpenAI Ada embeddings
  const vector = new Array(DIMENSIONS).fill(0);
  
  // Simple hashing of the text to seed the vector
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use the hash to seed a simple pseudo-random number generator
  const seededRandom = (n) => {
    return ((hash + 13) * (n + 7)) % 1000 / 1000;
  };
  
  // Fill the vector with seeded random values
  for (let i = 0; i < DIMENSIONS; i++) {
    vector[i] = (seededRandom(i) * 2) - 1; // Between -1 and 1
  }
  
  // Normalize the vector (divide by magnitude)
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  const normalizedVector = vector.map(val => val / magnitude);
  
  return normalizedVector;
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vectorA - First vector
 * @param {number[]} vectorB - Second vector
 * @returns {number} Cosine similarity (-1 to 1)
 */
function calculateCosineSimilarity(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || 
      vectorA.length === 0 || vectorB.length === 0 ||
      vectorA.length !== vectorB.length) {
    throw new Error('Invalid vectors for similarity calculation');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0; // Handle zero vectors
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  generateEmbedding,
  generateEmbeddingsBatch,
  processCodeChunksWithEmbeddings,
  calculateCosineSimilarity,
  useMock
};
