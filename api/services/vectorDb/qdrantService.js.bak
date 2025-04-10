/**
 * Qdrant Vector Database Service
 * 
 * Provides an interface to the Qdrant vector database for storing and
 * retrieving code embeddings.
 */
const { QdrantClient } = require('@qdrant/js-client-rest');
const config = require('../../config');

/**
 * Vector Database Service class that handles communication with Qdrant
 */
class QdrantService {
  constructor() {
    this.client = null;
    this.collections = config.vectorDb.collections;
    this.dimensions = config.vectorDb.dimensions;
    this.initialized = false;
  }

  /**
   * Initialize the Qdrant client and create collections if they don't exist
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      if (this.initialized && this.client) {
        return true;
      }

      console.log(`Initializing Qdrant client with URL: ${config.vectorDb.url}`);
      
      // Create Qdrant client
      this.client = new QdrantClient({ 
        url: config.vectorDb.url 
      });

      // For development/testing, skip connection test if no Qdrant server is running
      if (config.isDevelopment) {
        try {
          await this.testConnection();
          console.log('Successfully connected to Qdrant');
        } catch (connectionError) {
          console.warn('Could not connect to Qdrant server, using mock implementation');
          this.useMock = true;
        }
      } else {
        // In production, we require a successful connection
        await this.testConnection();
        console.log('Successfully connected to Qdrant');
      }

      // Create collections if they don't exist
      if (!this.useMock) {
        await this.ensureCollections();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize vector database:', error);
      if (config.isDevelopment) {
        console.warn('Continuing with mock implementation in development mode');
        this.useMock = true;
        this.initialized = true;
        return true;
      } else {
        this.initialized = false;
        return false;
      }
    }
  }

  /**
   * Test the connection to the Qdrant server
   * @returns {Promise<void>}
   */
  async testConnection() {
    try {
      // Use a basic API call to test connection
      // The health endpoint may not be available in all versions
      await this.client.getCollections();
    } catch (error) {
      console.error('Qdrant connection test failed:', error);
      throw new Error(`Failed to connect to Qdrant: ${error.message}`);
    }
  }

  /**
   * Ensure all required collections exist
   * @returns {Promise<void>}
   */
  async ensureCollections() {
    try {
      if (this.useMock) return;
      
      // List existing collections
      const collectionsResponse = await this.client.getCollections();
      const existingCollections = collectionsResponse.collections.map(c => c.name);
      
      console.log('Existing collections:', existingCollections);

      // Ensure code embeddings collection exists
      if (!existingCollections.includes(this.collections.codeEmbeddings)) {
        console.log(`Creating ${this.collections.codeEmbeddings} collection`);
        await this.client.createCollection(this.collections.codeEmbeddings, {
          vectors: {
            size: this.dimensions,
            distance: 'Cosine'
          },
          optimizers_config: {
            indexing_threshold: 100 // Index after 100 vectors
          }
        });
      }

      // Ensure document embeddings collection exists
      if (!existingCollections.includes(this.collections.documentEmbeddings)) {
        console.log(`Creating ${this.collections.documentEmbeddings} collection`);
        await this.client.createCollection(this.collections.documentEmbeddings, {
          vectors: {
            size: this.dimensions,
            distance: 'Cosine'
          },
          optimizers_config: {
            indexing_threshold: 100
          }
        });
      }

      // Ensure commit embeddings collection exists
      if (!existingCollections.includes(this.collections.commitEmbeddings)) {
        console.log(`Creating ${this.collections.commitEmbeddings} collection`);
        await this.client.createCollection(this.collections.commitEmbeddings, {
          vectors: {
            size: this.dimensions,
            distance: 'Cosine'
          },
          optimizers_config: {
            indexing_threshold: 100
          }
        });
      }

      console.log('All collections created successfully');
    } catch (error) {
      console.error('Error ensuring collections:', error);
      if (config.isDevelopment) {
        console.warn('Continuing with mock implementation in development mode');
        this.useMock = true;
      } else {
        throw error;
      }
    }
  }

  /**
   * Search for similar vectors in a collection
   * @param {string} collection - Collection name
   * @param {number[]} vector - Query vector
   * @param {Object} filters - Optional filters
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Search results
   */
  async search(collection, vector, filters = {}, limit = 5) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Use mock implementation for development/testing
      if (this.useMock) {
        return this.mockSearch(collection, vector, filters, limit);
      }

      const searchParams = {
        vector,
        limit,
        with_payload: true,
        with_vectors: false
      };

      // Add filters if provided
      if (Object.keys(filters).length > 0) {
        searchParams.filter = this.buildFilter(filters);
      }

      const results = await this.client.search(collection, searchParams);
      
      return results.map(result => ({
        id: result.id,
        score: result.score,
        payload: result.payload
      }));
    } catch (error) {
      console.error(`Error searching collection ${collection}:`, error);
      return this.mockSearch(collection, vector, filters, limit);
    }
  }

  /**
   * Mock search implementation for development/testing
   */
  mockSearch(collection, vector, filters, limit) {
    console.log('Using mock search implementation');
    
    // Generate some mock results
    const mockResults = [];
    
    for (let i = 0; i < limit; i++) {
      mockResults.push({
        id: `mock-id-${i}`,
        score: 0.9 - (i * 0.1),
        payload: {
          owner: filters.owner || 'mock-owner',
          repo: filters.repo || 'mock-repo',
          path: `mock/path/file${i}.js`,
          type: i === 0 ? 'component' : i === 1 ? 'function' : 'file',
          name: `MockUnit${i}`,
          content: `// This is a mock code unit ${i}\nfunction mockCode${i}() {\n  console.log('Mock implementation');\n}`,
          startLine: 1,
          endLine: 5,
          importance: 2 - (i * 0.2)
        }
      });
    }
    
    return mockResults;
  }

  /**
   * Insert or update vectors in a collection
   * @param {string} collection - Collection name
   * @param {Array} points - Points to insert
   * @returns {Promise<boolean>} Success status
   */
  async upsert(collection, points) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Use mock implementation for development/testing
      if (this.useMock) {
        console.log(`Mock: Upserted ${points.length} points to ${collection}`);
        return true;
      }

      // Ensure all points have the required fields
      const validPoints = points.filter(point => 
        point.id && point.vector && point.vector.length === this.dimensions && point.payload
      );

      if (validPoints.length === 0) {
        console.warn('No valid points to insert');
        return false;
      }

      // Upsert the points
      await this.client.upsert(collection, {
        points: validPoints
      });

      return true;
    } catch (error) {
      console.error(`Error upserting to collection ${collection}:`, error);
      if (config.isDevelopment) {
        console.log(`Mock: Upserted ${points.length} points to ${collection}`);
        return true;
      }
      return false;
    }
  }

  /**
   * Delete points from a collection
   * @param {string} collection - Collection name
   * @param {Array<string>} ids - Point IDs to delete
   * @returns {Promise<boolean>} Success status
   */
  async delete(collection, ids) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Use mock implementation for development/testing
      if (this.useMock) {
        console.log(`Mock: Deleted ${ids.length} points from ${collection}`);
        return true;
      }

      if (!Array.isArray(ids) || ids.length === 0) {
        return false;
      }

      await this.client.delete(collection, {
        points: ids
      });

      return true;
    } catch (error) {
      console.error(`Error deleting from collection ${collection}:`, error);
      return false;
    }
  }

  /**
   * Delete points by filter
   * @param {string} collection - Collection name
   * @param {Object} filters - Filters to match points
   * @returns {Promise<boolean>} Success status
   */
  async deleteByFilter(collection, filters) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Use mock implementation for development/testing
      if (this.useMock) {
        console.log(`Mock: Deleted points by filter from ${collection}`);
        return true;
      }

      if (Object.keys(filters).length === 0) {
        console.warn('No filters provided for deleteByFilter');
        return false;
      }

      await this.client.delete(collection, {
        filter: this.buildFilter(filters)
      });

      return true;
    } catch (error) {
      console.error(`Error deleting by filter from collection ${collection}:`, error);
      return false;
    }
  }

  /**
   * Build a filter object for Qdrant queries
   * @param {Object} filters - Filter criteria
   * @returns {Object} Qdrant filter object
   */
  buildFilter(filters) {
    // Simple filter builder
    const conditions = [];

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue;

      if (Array.isArray(value)) {
        // Handle array values (IN operator)
        conditions.push({
          key,
          match: {
            any: value
          }
        });
      } else {
        // Handle simple match
        conditions.push({
          key,
          match: {
            value
          }
        });
      }
    }

    if (conditions.length === 0) {
      return {};
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    // Combine conditions with AND
    return {
      must: conditions
    };
  }

  /**
   * Get the count of points in a collection
   * @param {string} collection - Collection name
   * @param {Object} filters - Optional filters
   * @returns {Promise<number>} Point count
   */
  async count(collection, filters = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Use mock implementation for development/testing
      if (this.useMock) {
        return 100; // Mock count
      }

      const countParams = {};
      
      // Add filters if provided
      if (Object.keys(filters).length > 0) {
        countParams.filter = this.buildFilter(filters);
      }

      const result = await this.client.count(collection, countParams);
      return result.count;
    } catch (error) {
      console.error(`Error counting points in collection ${collection}:`, error);
      return 0;
    }
  }
}

// Create a singleton instance
const qdrantService = new QdrantService();

module.exports = qdrantService;
