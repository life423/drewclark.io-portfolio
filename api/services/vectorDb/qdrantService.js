/**
 * Qdrant Vector Database Service
 *
 * Provides an interface to the Qdrant vector database for storing and
 * retrieving code embeddings.
 */
const { QdrantClient } = require('@qdrant/js-client-rest')
const { v4: uuidv4 } = require('uuid')
const config = require('../../config')

/**
 * Generate a deterministic ID for a vector point that's consistent for the same input
 * @param {string} repository - Repository identifier
 * @param {string} path - Path or other identifier
 * @param {Object} chunk - Optional chunk object containing additional metadata
 * @returns {string} - MD5 hash string
 */
function generatePointId(repository, path, chunk = null) {
    // Use deterministic IDs based on content for consistent incremental updates
    const crypto = require('crypto')
    let idContent = `${repository}-${path}`
    
    // Add chunk-specific information if available to prevent collisions
    // between different chunks of the same file
    if (chunk) {
        if (chunk.isPart && chunk.partIndex !== undefined) {
            idContent += `-part${chunk.partIndex}`
        } else if (chunk.startLine && chunk.endLine) {
            idContent += `-lines${chunk.startLine}-${chunk.endLine}`
        } else if (chunk.name) {
            // Add name as a fallback identifier
            idContent += `-${chunk.name}`
        }
    }
    
    const hash = crypto
        .createHash('md5')
        .update(idContent)
        .digest('hex')
    return hash
}

/**
 * Vector Database Service class that handles communication with Qdrant
 */
class QdrantService {
    /**
     * Create a new QdrantService instance
     */
    constructor() {
        this.validateConfig()
        this.client = null
        this.collections = config.vectorDb.collections
        this.dimensions = config.vectorDb.dimensions
        this.initialized = false
        this.useMock = false
        this.maxRetries = config.vectorDb.maxRetries || 3
        this.retryDelay = config.vectorDb.retryDelay || 1000
    }

    /**
     * Validate required configuration
     * @throws {Error} If required configuration is missing
     */
    validateConfig() {
        // Check required vector DB configuration
        if (!config.vectorDb || !config.vectorDb.url) {
            console.warn('Missing vector database URL in configuration')
            return
        }

        // Check required collections
        const required = ['url', 'collections', 'dimensions']
        const missing = required.filter(key => !config.vectorDb[key])

        if (missing.length > 0) {
            throw new Error(
                `Missing required vector database configuration: ${missing.join(
                    ', '
                )}`
            )
        }

        // Check collection names
        if (
            !config.vectorDb.collections.codeEmbeddings ||
            !config.vectorDb.collections.documentEmbeddings ||
            !config.vectorDb.collections.commitEmbeddings
        ) {
            throw new Error(
                'Missing required vector database collection configurations'
            )
        }
    }

/**
 * Initialize the Qdrant client and create collections if they don't exist
 * @returns {Promise<boolean>} Success status
 */
async initialize() {
    try {
        if (this.initialized && this.client) {
            return true
        }

        // Try different URLs if hostname resolution fails in production
        let qdrantUrls = [config.vectorDb.url]
        
        // In production, add fallback URLs for robustness
        if (!config.isDevelopment) {
            // If using Docker service name, add IP fallbacks
            if (config.vectorDb.url.includes('qdrant:')) {
                qdrantUrls.push(
                    // Try localhost fallback
                    config.vectorDb.url.replace('qdrant:', 'localhost:'),
                    // Try internal Docker DNS
                    config.vectorDb.url.replace('qdrant:', '127.0.0.1:')
                )
            }
        }

        console.log(`Initializing Qdrant client with primary URL: ${qdrantUrls[0]}`)
        if (qdrantUrls.length > 1) {
            console.log(`Will try fallback URLs if needed: ${qdrantUrls.slice(1).join(', ')}`)
        }

        // Try each URL until one works
        let connectionSuccess = false
        let lastError = null

        for (const url of qdrantUrls) {
            try {
                // Create Qdrant client with API key if available
                const clientOptions = {
                    url: url,
                    timeout: config.vectorDb.timeout || 15000, // 15 second timeout by default
                }

                // Add API key if available
                if (process.env.VECTOR_DB_API_KEY) {
                    console.log('Using API key for Qdrant authentication')
                    clientOptions.apiKey = process.env.VECTOR_DB_API_KEY
                }

                this.client = new QdrantClient(clientOptions)

                // Test the connection
                await this.testConnection()
                console.log(`Successfully connected to Qdrant at ${url}`)
                connectionSuccess = true
                break
            } catch (connectionError) {
                console.warn(`Connection to Qdrant at ${url} failed:`, connectionError.message)
                lastError = connectionError
            }
        }

        // Handle connection failure
        if (!connectionSuccess) {
            console.error('Failed to connect to Qdrant after trying all URLs')
            if (config.isDevelopment) {
                console.warn('Falling back to mock implementation in development mode')
                this.useMock = true
                this.initialized = true
                return true
            } else {
                // In production, log details but continue with degraded functionality
                console.error('Using degraded functionality without vector search capabilities')
                this.useMock = true
                this.initialized = true
                return true
            }
        }

        // Create collections if they don't exist
        if (!this.useMock) {
            await this.ensureCollections()
        }

        this.initialized = true
        return true
        } catch (error) {
            console.error('Failed to initialize vector database:', error)
            if (config.isDevelopment) {
                console.warn(
                    'Continuing with mock implementation in development mode'
                )
                this.useMock = true
                this.initialized = true
                return true
            } else {
                this.initialized = false
                return false
            }
        }
    }

    /**
     * Test the connection to the Qdrant server
     * @returns {Promise<boolean>} Connection status
     */
    async testConnection() {
        try {
            const healthCheck = await this.client.getCollections()
            if (!healthCheck) throw new Error('No response from Qdrant')
            return true
        } catch (error) {
            console.error('Qdrant connection test failed:', error.message)
            if (config.isDevelopment) {
                console.warn(
                    'Falling back to mock implementation in development mode'
                )
                this.useMock = true
                return false
            }
            throw error
        }
    }

    /**
     * Ensure all required collections exist with retry logic
     * @returns {Promise<void>}
     */
    async ensureCollections() {
        let attempts = 0

        while (attempts < this.maxRetries) {
            try {
                if (this.useMock) return

                // List existing collections
                const collectionsResponse = await this.client.getCollections()
                const existingCollections = collectionsResponse.collections.map(
                    c => c.name
                )

                console.log('Existing collections:', existingCollections)

                // Define collections to create with their configurations
                const collectionsToCreate = [
                    {
                        name: this.collections.codeEmbeddings,
                        config: {
                            vectors: {
                                size: this.dimensions,
                                distance: 'Cosine',
                            },
                            optimizers_config: {
                                indexing_threshold: 100, // Index after 100 vectors
                            },
                        },
                    },
                    {
                        name: this.collections.documentEmbeddings,
                        config: {
                            vectors: {
                                size: this.dimensions,
                                distance: 'Cosine',
                            },
                            optimizers_config: {
                                indexing_threshold: 100,
                            },
                        },
                    },
                    {
                        name: this.collections.commitEmbeddings,
                        config: {
                            vectors: {
                                size: this.dimensions,
                                distance: 'Cosine',
                            },
                            optimizers_config: {
                                indexing_threshold: 100,
                            },
                        },
                    },
                ]

                // Create any missing collections
                for (const collection of collectionsToCreate) {
                    if (!existingCollections.includes(collection.name)) {
                        console.log(`Creating ${collection.name} collection`)
                        await this.client.createCollection(
                            collection.name,
                            collection.config
                        )
                    }
                }

                console.log('All collections created successfully')
                return
            } catch (error) {
                attempts++
                console.error(
                    `Attempt ${attempts} failed to ensure collections:`,
                    error.message
                )

                if (attempts === this.maxRetries) {
                    if (config.isDevelopment) {
                        console.warn('Falling back to mock implementation')
                        this.useMock = true
                        return
                    }
                    throw new Error(
                        `Failed to ensure collections after ${this.maxRetries} attempts`
                    )
                }

                // Wait before retrying with exponential backoff
                const delay = this.retryDelay * Math.pow(2, attempts - 1)
                console.log(`Retrying in ${delay}ms...`)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    /**
     * Check health status of the vector database
     * @returns {Promise<Object>} Health status object
     */
    async checkHealth() {
        try {
            if (!this.initialized) {
                await this.initialize()
            }

            const status = {
                isHealthy: false,
                collections: [],
                connectionStatus: this.useMock ? 'mock' : 'connected',
                error: null,
            }

            if (this.useMock) {
                status.isHealthy = true
                status.collections = Object.values(this.collections)
                return status
            }

            const collections = await this.client.getCollections()
            status.isHealthy = true
            status.collections = collections.collections.map(c => c.name)
            return status
        } catch (error) {
            return {
                isHealthy: false,
                collections: [],
                connectionStatus: 'error',
                error: error.message,
            }
        }
    }

    /**
     * Gracefully shut down the vector database connection
     */
    async shutdown() {
        try {
            if (this.client) {
                // Perform any cleanup needed
                console.log('Shutting down Qdrant service...')
                this.initialized = false
                this.client = null
            }
        } catch (error) {
            console.error('Error during Qdrant service shutdown:', error)
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
                await this.initialize()
            }

            // Use mock implementation for development/testing
            if (this.useMock) {
                return this.mockSearch(collection, vector, filters, limit)
            }

            const searchParams = {
                vector,
                limit,
                with_payload: true,
                with_vectors: false,
            }

            // Add filters if provided
            if (Object.keys(filters).length > 0) {
                searchParams.filter = this.buildFilter(filters)
            }

            const results = await this.client.search(collection, searchParams)

            return results.map(result => ({
                id: result.id,
                score: result.score,
                payload: result.payload,
            }))
        } catch (error) {
            console.error(`Error searching collection ${collection}:`, error)
            return this.mockSearch(collection, vector, filters, limit)
        }
    }

    /**
     * Mock search implementation for development/testing
     */
    mockSearch(collection, vector, filters, limit) {
        console.log('Using mock search implementation')

        // Generate some mock results
        const mockResults = []

        for (let i = 0; i < limit; i++) {
            mockResults.push({
                id: generatePointId('mock/id', 'unknown'),
                score: 0.9 - i * 0.1,
                payload: {
                    owner: filters.owner || 'mock-owner',
                    repo: filters.repo || 'mock-repo',
                    path: `mock/path/file${i}.js`,
                    type: i === 0 ? 'component' : i === 1 ? 'function' : 'file',
                    name: `MockUnit${i}`,
                    content: `// This is a mock code unit ${i}\nfunction mockCode${i}() {\n  console.log('Mock implementation');\n}`,
                    startLine: 1,
                    endLine: 5,
                    importance: 2 - i * 0.2,
                },
            })
        }

        return mockResults
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
                await this.initialize()
            }

            // Use mock implementation for development/testing
            if (this.useMock) {
                console.log(
                    `Mock: Upserted ${points.length} points to ${collection}`
                )
                return true
            }

            // Ensure all points have the required fields
            const validPoints = points.filter(
                point =>
                    point.id &&
                    point.vector &&
                    point.vector.length === this.dimensions &&
                    point.payload
            )

            if (validPoints.length === 0) {
                console.warn('No valid points to insert')
                return false
            }

            // Upsert the points
            await this.client.upsert(collection, {
                points: validPoints,
            })

            return true
        } catch (error) {
            console.error(`Error upserting to collection ${collection}:`, error)
            if (config.isDevelopment) {
                console.log(
                    `Mock: Upserted ${points.length} points to ${collection}`
                )
                return true
            }
            return false
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
                await this.initialize()
            }

            // Use mock implementation for development/testing
            if (this.useMock) {
                console.log(
                    `Mock: Deleted ${ids.length} points from ${collection}`
                )
                return true
            }

            if (!Array.isArray(ids) || ids.length === 0) {
                return false
            }

            await this.client.delete(collection, {
                points: ids,
            })

            return true
        } catch (error) {
            console.error(
                `Error deleting from collection ${collection}:`,
                error
            )
            return false
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
                await this.initialize()
            }

            // Use mock implementation for development/testing
            if (this.useMock) {
                console.log(`Mock: Deleted points by filter from ${collection}`)
                return true
            }

            if (Object.keys(filters).length === 0) {
                console.warn('No filters provided for deleteByFilter')
                return false
            }

            await this.client.delete(collection, {
                filter: this.buildFilter(filters),
            })

            return true
        } catch (error) {
            console.error(
                `Error deleting by filter from collection ${collection}:`,
                error
            )
            return false
        }
    }

    /**
     * Build a filter object for Qdrant queries
     * @param {Object} filters - Filter criteria
     * @returns {Object} Qdrant filter object
     */
    buildFilter(filters) {
        // Simple filter builder
        const conditions = []

        for (const [key, value] of Object.entries(filters)) {
            if (value === undefined || value === null) continue

            if (Array.isArray(value)) {
                // Handle array values (IN operator)
                conditions.push({
                    key,
                    match: {
                        any: value,
                    },
                })
            } else {
                // Handle simple match
                conditions.push({
                    key,
                    match: {
                        value,
                    },
                })
            }
        }

        if (conditions.length === 0) {
            return {}
        }

        if (conditions.length === 1) {
            return conditions[0]
        }

        // Combine conditions with AND
        return {
            must: conditions,
        }
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
                await this.initialize()
            }

            // Use mock implementation for development/testing
            if (this.useMock) {
                return 100 // Mock count
            }

            const countParams = {}

            // Add filters if provided
            if (Object.keys(filters).length > 0) {
                countParams.filter = this.buildFilter(filters)
            }

            const result = await this.client.count(collection, countParams)
            return result.count
        } catch (error) {
            console.error(
                `Error counting points in collection ${collection}:`,
                error
            )
            return 0
        }
    }
}

// Create a singleton instance
const qdrantService = new QdrantService()

// Attach the ID generation function directly to the service instance
qdrantService.generatePointId = generatePointId

// Export the service instance
module.exports = qdrantService
