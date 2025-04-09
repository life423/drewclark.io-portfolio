/**
 * Chunking Service
 * 
 * Handles semantic chunking of code units and implements sliding window
 * approach for large code units.
 */

// Maximum size for a single chunk
const MAX_CHUNK_SIZE = 8000; // Characters

// Overlap percentage for sliding window
const OVERLAP_PERCENTAGE = 10; // 10% overlap

/**
 * Process code units into semantically meaningful chunks
 * @param {Array} units - Code units from parser
 * @returns {Array} Semantically chunked units
 */
function semanticChunking(units) {
  if (!Array.isArray(units)) {
    console.warn('Units is not an array:', typeof units);
    return [];
  }
  
  // Sort units by importance
  const sortedUnits = [...units].sort((a, b) => b.importance - a.importance);
  
  // Process each unit to ensure it's not too large
  const chunks = [];
  
  for (const unit of sortedUnits) {
    if (!unit.content || typeof unit.content !== 'string') {
      console.warn(`Invalid unit content for ${unit.name}`, unit);
      continue;
    }
    
    if (unit.content.length <= MAX_CHUNK_SIZE) {
      // Unit fits as is
      chunks.push(unit);
    } else {
      // Large unit needs chunking
      const subChunks = breakIntoSubChunks(unit);
      chunks.push(...subChunks);
    }
  }
  
  return chunks;
}

/**
 * Break a large unit into smaller, meaningful subchunks
 * @param {Object} unit - Code unit
 * @returns {Array} Smaller chunks
 */
function breakIntoSubChunks(unit) {
  const { content, type, name, path } = unit;
  
  // For files, we use the sliding window approach
  if (type === 'file') {
    return slidingWindowChunking(unit);
  }
  
  // For functions and classes, try to preserve logical blocks
  const lines = content.split('\n');
  
  // If not that much over, just return as is with a note
  if (content.length < MAX_CHUNK_SIZE * 1.2) {
    return [{
      ...unit,
      content,
      name: `${name} (large)`,
      isLarge: true
    }];
  }
  
  // Otherwise, break it up by logical blocks
  const chunks = [];
  let currentChunk = '';
  let currentLines = [];
  let chunkIndex = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // If adding this line would make the chunk too big, create a new chunk
    if (currentChunk.length + line.length + 1 > MAX_CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push({
        type,
        name: `${name} (part ${chunkIndex})`,
        content: currentChunk,
        path,
        startLine: i - currentLines.length + unit.startLine,
        endLine: i - 1 + unit.startLine,
        isPart: true,
        partIndex: chunkIndex,
        partOf: name,
        importance: unit.importance * 0.9 // Slightly less important than the whole
      });
      
      chunkIndex++;
      currentChunk = '';
      currentLines = [];
    }
    
    currentChunk += line + '\n';
    currentLines.push(line);
  }
  
  // Add the last chunk if there is one
  if (currentChunk.length > 0) {
    chunks.push({
      type,
      name: `${name} (part ${chunkIndex})`,
      content: currentChunk,
      path,
      startLine: lines.length - currentLines.length + unit.startLine,
      endLine: unit.endLine,
      isPart: true,
      partIndex: chunkIndex,
      partOf: name,
      importance: unit.importance * 0.9
    });
  }
  
  return chunks;
}

/**
 * Use sliding window approach for large units
 * @param {Object} unit - Code unit
 * @returns {Array} Chunks from sliding window
 */
function slidingWindowChunking(unit) {
  const { content, type, name, path } = unit;
  const chunks = [];
  const windowSize = MAX_CHUNK_SIZE;
  const overlap = Math.floor(windowSize * (OVERLAP_PERCENTAGE / 100)); // Convert percentage to actual overlap
  
  // If not much over the limit, keep as one chunk
  if (content.length < windowSize * 1.2) {
    return [unit];
  }
  
  let position = 0;
  let chunkIndex = 1;
  const lines = content.split('\n');
  
  while (position < content.length) {
    // Calculate end position
    const end = Math.min(position + windowSize, content.length);
    
    // Extract chunk
    const chunkContent = content.substring(position, end);
    
    // Calculate line numbers
    const startLine = content.substring(0, position).split('\n').length;
    const endLine = startLine + chunkContent.split('\n').length - 1;
    
    // Add to chunks
    chunks.push({
      type: `${type}_segment`,
      name: `${name} (segment ${chunkIndex})`,
      content: chunkContent,
      path,
      startLine: startLine + (unit.startLine || 1) - 1,
      endLine: endLine + (unit.startLine || 1) - 1,
      isPart: true,
      partIndex: chunkIndex,
      partOf: name,
      importance: unit.importance ? unit.importance * 0.8 : 0.8 // File segments are less important
    });
    
    // Move position forward (with overlap)
    position = end - overlap;
    
    // Avoid getting stuck at the end
    if (position >= content.length - overlap) {
      break;
    }
    
    chunkIndex++;
  }
  
  return chunks;
}

/**
 * Apply chunking to repository units
 * @param {Array} units - All code units from repository
 * @returns {Promise<Array>} Chunked units ready for embedding
 */
async function chunkRepositoryUnits(units) {
  try {
    console.log(`Chunking ${units.length} repository units`);
    
    // Apply semantic chunking
    const chunks = semanticChunking(units);
    
    console.log(`Created ${chunks.length} chunks from ${units.length} units`);
    
    return chunks;
  } catch (error) {
    console.error('Error chunking repository units:', error);
    return [];
  }
}

module.exports = {
  semanticChunking,
  chunkRepositoryUnits,
  MAX_CHUNK_SIZE,
  OVERLAP_PERCENTAGE
};
