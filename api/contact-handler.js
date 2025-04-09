/**
 * Contact form submission handler
 * 
 * Handles storing and retrieving contact form submissions
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Path to contact messages
const CONTACT_DIR = path.join(__dirname, '..', 'data', 'contact');
const MESSAGES_FILE = path.join(CONTACT_DIR, 'messages.json');

// Ensure the contact directory exists
function ensureContactDir() {
    if (!fs.existsSync(CONTACT_DIR)) {
        fs.mkdirSync(CONTACT_DIR, { recursive: true });
    }
}

// Get all messages
function getMessages() {
    ensureContactDir();
    
    if (!fs.existsSync(MESSAGES_FILE)) {
        return [];
    }
    
    try {
        const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading messages file:', error);
        return [];
    }
}

// Save all messages
function saveMessages(messages) {
    ensureContactDir();
    
    try {
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving messages file:', error);
        return false;
    }
}

// Add a new message
function addMessage(name, email, message) {
    const messages = getMessages();
    
    const newMessage = {
        id: crypto.randomBytes(8).toString('hex'),
        name,
        email,
        message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    messages.push(newMessage);
    return saveMessages(messages) ? newMessage : null;
}

// Mark a message as read
function markMessageRead(id, isRead = true) {
    const messages = getMessages();
    const messageIndex = messages.findIndex(msg => msg.id === id);
    
    if (messageIndex === -1) {
        return false;
    }
    
    messages[messageIndex].read = isRead;
    return saveMessages(messages);
}

// Delete a message
function deleteMessage(id) {
    const messages = getMessages();
    const filteredMessages = messages.filter(msg => msg.id !== id);
    
    if (filteredMessages.length === messages.length) {
        return false; // No message was removed
    }
    
    return saveMessages(filteredMessages);
}

// Generate a secure admin token
function generateAdminToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Verify admin token
function verifyAdminToken(token) {
    const ADMIN_TOKEN = process.env.ADMIN_ACCESS_TOKEN;
    
    console.log('Verifying admin token...');
    console.log('Provided token:', token);
    console.log('Expected token from env:', ADMIN_TOKEN);
    console.log('Token length:', token?.length, 'Expected length:', ADMIN_TOKEN?.length);
    console.log('Do they match?', token === ADMIN_TOKEN);
    
    if (!ADMIN_TOKEN) {
        console.warn('Warning: ADMIN_ACCESS_TOKEN not set in environment variables');
        return false;
    }
    
    // Compare trimmed values to handle any whitespace issues
    return token.trim() === ADMIN_TOKEN.trim();
}

module.exports = {
    getMessages,
    addMessage,
    markMessageRead,
    deleteMessage,
    generateAdminToken,
    verifyAdminToken
};
