# Drew Clark Portfolio

Personal portfolio website with OpenAI integration.

## Containerized Application

This application has been containerized with Docker, which simplifies deployment and ensures consistency across environments.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- OpenAI API Key

### Environment Variables

Create a `.env` file in the root directory with the following:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Development

### Running with Docker (Recommended)

```bash
# Start the development environment with hot reloading
npm run docker:dev

# Or directly with docker-compose
docker-compose up dev
```

This will:
- Build the development container
- Mount your local directories for hot reloading
- Start the server with Nodemon for automatic restarts
- Expose the application on http://localhost:3000

### Running Locally Without Docker

```bash
# Install dependencies
npm install
cd app && npm install && cd ..

# Start development server
npm run dev
```

## Production

### Building and Running the Production Container

```bash
# Build the production image
npm run docker:build

# Run the container
npm run docker:run

# Or use docker-compose
docker-compose up app
```

This will:
- Build the frontend assets
- Create an optimized production container
- Start the server in production mode
- Expose the application on http://localhost:3000

### Manual Production Build

```bash
# Install dependencies
npm install
cd app && npm install && cd ..

# Build frontend
npm run build

# Start production server
npm start
```

## Architecture

The application consists of:

1. **Frontend**: React application with Vite
2. **Backend**: Express.js server that:
   - Serves the static frontend assets
   - Provides API endpoints for OpenAI integration

## API Endpoints

- `GET /api/askGPT`: Health check endpoint
- `POST /api/askGPT`: Send questions to OpenAI

Example request:
```json
{
  "question": "Tell me about Drew Clark's portfolio",
  "model": "gpt-3.5-turbo",  // optional
  "temperature": 0.7,        // optional
  "maxTokens": 500           // optional
}
```

## Docker Configuration

- `Dockerfile`: Production container configuration
- `Dockerfile.dev`: Development container with hot reloading
- `docker-compose.yml`: Service definitions for both dev and production
