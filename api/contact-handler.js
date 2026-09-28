/**
 * Contact form storage
 *
 * Uses MongoDB when MONGODB_URI is set. Otherwise falls back to a local JSON
 * file, which is fine for development but is wiped whenever a container restarts.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getDb } = require('./db');

const DB_NAME = process.env.MONGODB_DB || 'portfolio';
const COLLECTION = 'messages';
const useMongo = Boolean(process.env.MONGODB_URI);

console.log(
    useMongo
        ? `Contact messages: MongoDB (${DB_NAME}.${COLLECTION})`
        : 'Contact messages: local file data/contact/messages.json (set MONGODB_URI to use MongoDB)'
);

// ─── MongoDB ────────────────────────────────────────────────────────────────
// Uses the shared connection in db.js
async function getCollection() {
    const db = await getDb();
    return db.collection(COLLECTION);
}

// Documents use the message id as _id; the API exposes it as `id`
function fromDoc({ _id, ...rest }) {
    return { id: _id, ...rest };
}

// ─── Local file (development fallback) ─────────────────────────────────────
const CONTACT_DIR = path.join(__dirname, '..', 'data', 'contact');
const MESSAGES_FILE = path.join(CONTACT_DIR, 'messages.json');

function readFile() {
    try {
        return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function writeFile(messages) {
    fs.mkdirSync(CONTACT_DIR, { recursive: true });
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
}

// ─── Public API ─────────────────────────────────────────────────────────────

// Newest first
async function getMessages() {
    if (useMongo) {
        const collection = await getCollection();
        const docs = await collection.find().sort({ timestamp: -1 }).toArray();
        return docs.map(fromDoc);
    }
    return readFile().sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
}

async function addMessage(name, email, message) {
    const doc = {
        _id: crypto.randomBytes(8).toString('hex'),
        name,
        email,
        message,
        timestamp: new Date(),
        read: false,
    };
    if (useMongo) {
        const collection = await getCollection();
        await collection.insertOne(doc);
    } else {
        const messages = readFile();
        messages.push({ ...fromDoc(doc), timestamp: doc.timestamp.toISOString() });
        writeFile(messages);
    }
    return fromDoc(doc);
}

async function markMessageRead(id, isRead = true) {
    if (useMongo) {
        const collection = await getCollection();
        const result = await collection.updateOne({ _id: String(id) }, { $set: { read: Boolean(isRead) } });
        return result.matchedCount === 1;
    }
    const messages = readFile();
    const target = messages.find(msg => msg.id === id);
    if (!target) {
        return false;
    }
    target.read = Boolean(isRead);
    writeFile(messages);
    return true;
}

async function deleteMessage(id) {
    if (useMongo) {
        const collection = await getCollection();
        const result = await collection.deleteOne({ _id: String(id) });
        return result.deletedCount === 1;
    }
    const messages = readFile();
    const remaining = messages.filter(msg => msg.id !== id);
    if (remaining.length === messages.length) {
        return false;
    }
    writeFile(remaining);
    return true;
}

module.exports = {
    getMessages,
    addMessage,
    markMessageRead,
    deleteMessage,
};
