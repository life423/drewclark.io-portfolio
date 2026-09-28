/**
 * Shared MongoDB connection
 *
 * One client per process, connected on first use. Contact messages and the
 * code index both go through here.
 */
const { MongoClient } = require('mongodb');

let client = null;
let dbPromise = null;

function isMongoConfigured() {
    return Boolean(process.env.MONGODB_URI);
}

function getDb() {
    if (!isMongoConfigured()) {
        return Promise.reject(new Error('MONGODB_URI is not set'));
    }
    if (!dbPromise) {
        client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
        dbPromise = client
            .connect()
            .then(connected => connected.db(process.env.MONGODB_DB || 'portfolio'))
            .catch(error => {
                // Try again on the next call
                client = null;
                dbPromise = null;
                throw error;
            });
    }
    return dbPromise;
}

async function closeDb() {
    const current = client;
    client = null;
    dbPromise = null;
    if (current) {
        await current.close();
    }
}

module.exports = { getDb, closeDb, isMongoConfigured };
