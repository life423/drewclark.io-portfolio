/**
 * OpenAI embeddings for the code index (used by the indexer and by chat search)
 */
const { OpenAI } = require('openai');
const config = require('../../config');

let client = null;

function getClient() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
    }
    if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return client;
}

// Embeds a list of texts in one request. Vectors come back in the same order.
async function embedTexts(texts) {
    const response = await getClient().embeddings.create({
        model: config.codeIndex.embeddingModel,
        input: texts,
    });
    const vectors = [...response.data]
        .sort((a, b) => a.index - b.index)
        .map(item => item.embedding);
    return { vectors, tokens: response.usage?.total_tokens || 0 };
}

module.exports = { embedTexts };
