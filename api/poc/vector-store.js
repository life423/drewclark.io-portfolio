/**
 * Vector Store for Code Embedding POC
 * 
 * A simple in-memory vector store for embeddings with cosine similarity search.
 */

const { generateEmbedding } = require('./embeddings');
const { loadEmbeddings } = require('./embeddings');

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Cosine similarity (between -1 and 1)
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimension');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0; // Handle zero vectors
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * VectorStore class for storing and searching code embeddings
 */
class VectorStore {
  constructor() {
    this.segments = [];
    this.isLoaded = false;
  }
  
  /**
   * Load embeddings from repository
   * @param {string} repoOwner - Repository owner
   * @param {string} repoName - Repository name
   * @returns {Promise<boolean>} Success status
   */
  async loadRepository(repoOwner, repoName) {
    try {
      const embeddings = await loadEmbeddings(repoOwner, repoName);
      
      if (!embeddings || embeddings.length === 0) {
        console.error('No embeddings found for this repository');
        return false;
      }
      
      this.segments = embeddings;
      this.isLoaded = true;
      
      console.log(`Loaded ${this.segments.length} segments into vector store`);
      return true;
    } catch (error) {
      console.error('Error loading repository embeddings:', error.message);
      return false;
    }
  }
  
  /**
   * Add segments directly to the vector store
   * @param {Array} segmentsWithEmbeddings - Code segments with embeddings
   */
  addSegments(segmentsWithEmbeddings) {
    this.segments = this.segments.concat(segmentsWithEmbeddings);
    this.isLoaded = true;
    console.log(`Added ${segmentsWithEmbeddings.length} segments to vector store`);
  }
  
  /**
   * Find most similar code segments for a query
   * @param {string} query - Question or query text
   * @param {number} limit - Maximum number of results to return
   * @returns {Promise<Array>} Matching code segments with similarity scores
   */
  async findSimilarCode(query, limit = 5) {
    if (!this.isLoaded || this.segments.length === 0) {
      throw new Error('No embeddings loaded in vector store');
    }
    
    try {
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);
      
      // Calculate similarity scores for all segments
      const scoredSegments = this.segments.map(segment => {
        const similarity = cosineSimilarity(queryEmbedding, segment.embedding);
        return {
          segment,
          similarity
        };
      });
      
      // Sort by similarity score (highest first)
      scoredSegments.sort((a, b) => b.similarity - a.similarity);
      
      // Return top matches
      const topMatches = scoredSegments.slice(0, limit).map(scored => ({
        path: scored.segment.path,
        type: scored.segment.type,
        name: scored.segment.name,
        language: scored.segment.language,
        content: scored.segment.content,
        startLine: scored.segment.startLine,
        endLine: scored.segment.endLine,
        similarity: scored.similarity
      }));
      
      console.log(`Found ${topMatches.length} matches for query`);
      return topMatches;
    } catch (error) {
      console.error('Error finding similar code:', error.message);
      throw error;
    }
  }
  
  /**
   * Clear all embeddings from the store
   */
  clear() {
    this.segments = [];
    this.isLoaded = false;
    console.log('Vector store cleared');
  }
  
  /**
   * Get the number of segments in the store
   * @returns {number} Number of segments
   */
  get size() {
    return this.segments.length;
  }
}

// Create a singleton instance
const vectorStore = new VectorStore();

module.exports = {
  vectorStore,
  cosineSimilarity
};
