const { OpenAI } = require('openai')
const config = require('../../config')

let useMock = false

let openaiClient
try {
    if (config.openAiApiKey) {
        openaiClient = new OpenAI({ apiKey: config.openAiApiKey })
        console.log('OpenAI client initialized for embeddings')
    } else {
        console.warn(
            'No OpenAI API key provided, using mock implementation for embeddings'
        )
        useMock = true
    }
} catch (error) {
    console.error('Error initializing OpenAI client:', error.message)
    useMock = true
}

async function generateEmbedding(text) {
    try {
        if (useMock || process.env.NODE_ENV === 'test') {
            return mockGenerateEmbedding(text)
        }

        if (!openaiClient) {
            throw new Error('OpenAI client not initialized')
        }

        const truncatedText =
            text.length > 8000 ? text.substring(0, 8000) : text

        const response = await openaiClient.embeddings.create({
            model: config.vectorDb.embeddingModel,
            input: truncatedText,
        })

        return response.data[0].embedding
    } catch (error) {
        console.error('Error generating embedding:', error)
        return mockGenerateEmbedding(text)
    }
}

async function generateEmbeddingsBatch(texts) {
    try {
        if (useMock || process.env.NODE_ENV === 'test') {
            return Promise.all(texts.map(text => mockGenerateEmbedding(text)))
        }

        if (!openaiClient) {
            throw new Error('OpenAI client not initialized')
        }

        if (!Array.isArray(texts) || texts.length === 0) {
            return []
        }

        const truncatedTexts = texts.map(text =>
            text.length > 8000 ? text.substring(0, 8000) : text
        )

        const response = await openaiClient.embeddings.create({
            model: config.vectorDb.embeddingModel,
            input: truncatedTexts,
        })

        return response.data.map(item => item.embedding)
    } catch (error) {
        console.error('Error generating batch embeddings:', error)
        return Promise.all(texts.map(text => mockGenerateEmbedding(text)))
    }
}

async function processCodeChunksWithEmbeddings(chunks, repoInfo) {
    try {
        if (!Array.isArray(chunks) || chunks.length === 0) {
            console.warn('No chunks provided for embedding')
            return []
        }

        const { owner, repo } = repoInfo

        console.log(
            `Processing ${chunks.length} chunks for embeddings from ${owner}/${repo}`
        )

        const texts = chunks.map(chunk => chunk.content)

        const embeddings = await generateEmbeddingsBatch(texts)

        const chunksWithEmbeddings = chunks.map((chunk, index) => ({
            ...chunk,
            embedding: embeddings[index],
            metadata: {
                owner,
                repo,
                type: chunk.type || 'code',
                path: chunk.path,
                name: chunk.name,
                importance: chunk.importance || 1,
            },
        }))

        console.log(
            `Successfully generated embeddings for ${chunksWithEmbeddings.length} chunks`
        )

        return chunksWithEmbeddings
    } catch (error) {
        console.error('Error processing code chunks with embeddings:', error)
        return []
    }
}

function mockGenerateEmbedding(text) {
    const DIMENSIONS = 1536
    const vector = new Array(DIMENSIONS).fill(0)

    let hash = 0
    for (let i = 0; i < text.length; i++) {
        hash = (hash << 5) - hash + text.charCodeAt(i)
        hash = hash & hash
    }

    const seededRandom = n => {
        return (((hash + 13) * (n + 7)) % 1000) / 1000
    }

    for (let i = 0; i < DIMENSIONS; i++) {
        vector[i] = seededRandom(i) * 2 - 1
    }

    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    const normalizedVector = vector.map(val => val / magnitude)

    return normalizedVector
}

function calculateCosineSimilarity(vectorA, vectorB) {
    if (
        !Array.isArray(vectorA) ||
        !Array.isArray(vectorB) ||
        vectorA.length === 0 ||
        vectorB.length === 0 ||
        vectorA.length !== vectorB.length
    ) {
        throw new Error('Invalid vectors for similarity calculation')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i]
        normA += vectorA[i] * vectorA[i]
        normB += vectorB[i] * vectorB[i]
    }

    if (normA === 0 || normB === 0) {
        return 0
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

module.exports = {
    generateEmbedding,
    generateEmbeddingsBatch,
    processCodeChunksWithEmbeddings,
    calculateCosineSimilarity,
    useMock,
}
