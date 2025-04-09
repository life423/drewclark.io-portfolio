# Contact Form System Documentation

This document explains how the contact form system works in the portfolio application.

## Overview

The contact form allows users to submit messages directly from the site, which are stored locally in a JSON file. The site owner (you) can view and manage these messages through a secure admin interface.

## Components

1. **Contact Form Modal**
   - Located in the mobile drawer
   - Collects name, email, and message
   - Submits to server-side API

2. **Backend Storage**
   - Saves messages to `data/contact/messages.json`
   - This location is excluded from Git (added to .gitignore)
   - No database required

3. **Admin Interface**
   - Secure admin panel at `/admin-messages?token=YOUR_TOKEN`
   - Token-based authentication (no login required)
   - View, mark as read/unread, and delete messages

## Using the Admin Panel

1. **Setup Your Token**:
   - Copy `.env.example` to `.env`
   - Generate a token with: `curl http://localhost:3000/api/admin/generate-token`
   - Add it to your .env file as `ADMIN_ACCESS_TOKEN=YOUR_GENERATED_TOKEN`

2. **Access the Admin Panel**:
   - Visit: `http://localhost:5173/admin-messages?token=YOUR_TOKEN`
   - In production, replace localhost with your actual domain

3. **Using the Panel**:
   - Messages are listed on the left side
   - Unread messages have a green indicator
   - Click a message to view its contents
   - You can mark messages as read/unread
   - Delete messages you no longer need
   - Copy email addresses with a single click

## Security Considerations

- The token should be kept secret and secure
- Only share the admin URL with people you trust
- The token generation endpoint is disabled in production
- Messages are stored locally on your server, not in a database
- No messages are ever sent to GitHub or external services

## For Developers

### API Endpoints

- **POST `/api/contact`**: Submit a new contact message
- **GET `/api/admin/messages?token=TOKEN`**: Get all messages (admin only)
- **PUT `/api/admin/messages/:id`**: Mark message as read/unread (admin only)
- **DELETE `/api/admin/messages/:id?token=TOKEN`**: Delete a message (admin only)
- **GET `/api/admin/generate-token`**: Generate admin token (development only)

### Message Format

```json
{
  "id": "unique-id",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'm interested in your portfolio!",
  "timestamp": "2025-04-08T21:44:00.000Z",
  "read": false
}
```

## Backup

Since messages are stored in a JSON file, you might want to periodically back up the `data/contact/messages.json` file to prevent data loss.
