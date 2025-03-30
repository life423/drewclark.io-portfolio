/**
 * Embeddings Service for Code Embedding POC
 * 
 * Handles generating embeddings for code segments using OpenAI API
 * and storing/retrieving them from a local JSON file.
 */

const { OpenAI } = require('openai');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

// Initialize OpenAI client
let openai;
try {
  openai = new OpenAI({ apiKey: config.openAiApiKey });
  console.log('OpenAI client initialized for embeddings');
} catch (error) {
  console.error('Error initializing OpenAI client:', error.message);
}

// Path to store embeddings
const EMBEDDINGS_DIR = path.join(__dirname, '../../data/embeddings');
const ensureEmbeddingsDir = async () => {
  try {
    await fs.mkdir(EMBEDDINGS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating embeddings directory:', error.message);
    throw error;
  }
};

/**
 * Generates an embedding for a text string
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Embedding vector
 */
async function generateEmbedding(text) {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }
  
  try {
    // Truncate text if too long (OpenAI has token limits)
    const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: truncatedText
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw error;
  }
}

/**
 * Generates embeddings for a collection of code segments
 * @param {Array} segments - Code segments to embed
 * @param {string} repoOwner - Repository owner
 * @param {string} repoName - Repository name
 * @returns {Promise<Array>} Code segments with embeddings
 */
async function generateEmbeddingsForSegments(segments, repoOwner, repoName) {
  await ensureEmbeddingsDir();
  
  console.log(`Generating embeddings for ${segments.length} code segments`);
  
  const segmentsWithEmbeddings = [];
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    try {
      // Generate embedding for the code content
      const embedding = await generateEmbedding(segment.content);
      
      // Add metadata for the segment
      const segmentWithEmbedding = {
        ...segment,
        embedding,
        metadata: {
          owner: repoOwner,
          repo: repoName,
          path: segment.path,
          type: segment.type,
          name: segment.name,
          language: segment.language,
          startLine: segment.startLine,
          endLine: segment.endLine
        }
      };
      
      segmentsWithEmbeddings.push(segmentWithEmbedding);
      
      // Log progress
      if ((i + 1) % 10 === 0 || i === segments.length - 1) {
        console.log(`Generated embeddings for ${i + 1}/${segments.length} segments`);
      }
    } catch (error) {
      console.error(`Error embedding segment ${segment.name}:`, error.message);
      // Continue with other segments even if one fails
    }
  }
  
  return segmentsWithEmbeddings;
}

/**
 * Saves embeddings to a JSON file
 * @param {Array} segmentsWithEmbeddings - Code segments with embeddings
 * @param {string} repoOwner - Repository owner
 * @param {string} repoName - Repository name
 * @returns {Promise<string>} Path to the saved file
 */
async function saveEmbeddings(segmentsWithEmbeddings, repoOwner, repoName) {
  await ensureEmbeddingsDir();
  
  const filename = `${repoOwner}-${repoName}-embeddings.json`;
  const filePath = path.join(EMBEDDINGS_DIR, filename);
  
  try {
    await fs.writeFile(filePath, JSON.stringify(segmentsWithEmbeddings, null, 2));
    console.log(`Saved ${segmentsWithEmbeddings.length} embeddings to ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error saving embeddings:', error.message);
    throw error;
  }
}

/**
 * Loads embeddings from a JSON file
 * @param {string} repoOwner - Repository owner
 * @param {string} repoName - Repository name
 * @returns {Promise<Array>} Code segments with embeddings
 */
async function loadEmbeddings(repoOwner, repoName) {
  const filename = `${repoOwner}-${repoName}-embeddings.json`;
  const filePath = path.join(EMBEDDINGS_DIR, filename);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const embeddings = JSON.parse(data);
    console.log(`Loaded ${embeddings.length} embeddings from ${filePath}`);
    return embeddings;
  } catch (error) {
    console.error('Error loading embeddings:', error.message);
    return null; // Return null if file doesn't exist or has errors
  }
}

/**
 * Main process for generating and saving embeddings for a repository
 * @param {Array} segments - Code segments from repository
 * @param {string} repoOwner - Repository owner
 * @param {string} repoName - Repository name
 * @returns {Promise<string>} Path to the saved embeddings file
 */
async function processRepositoryEmbeddings(segments, repoOwner, repoName) {
  try {
    const segmentsWithEmbeddings = await generateEmbeddingsForSegments(segments, repoOwner, repoName);
    const savedPath = await saveEmbeddings(segmentsWithEmbeddings, repoOwner, repoName);
    return savedPath;
  } catch (error) {
    console.error('Error processing repository embeddings:', error.message);
    throw error;
  }
}

module.exports = {
  generateEmbedding,
  processRepositoryEmbeddings,
  loadEmbeddings
};
