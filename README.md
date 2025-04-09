# Drew Clark Portfolio

Welcome to the portfolio of Drew Clark, showcasing projects and skills!

![Portfolio Banner](https://via.placeholder.com/1200x400?text=Drew+Clark+Portfolio)

## Table of Contents
- [Drew Clark Portfolio](#drew-clark-portfolio)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Running the Application](#running-the-application)
  - [AI Code Embedding System](#ai-code-embedding-system)
    - [System Architecture](#system-architecture)
    - [Setting Up Repositories](#setting-up-repositories)
    - [Troubleshooting the Embedding System](#troubleshooting-the-embedding-system)
  - [Running Tests](#running-tests)
  - [Deployment](#deployment)
  - [License](#license)
  - [Containerized Application](#containerized-application)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
      - [OpenAI API Key Setup](#openai-api-key-setup)
  - [Development](#development)
    - [Running with Docker (Recommended)](#running-with-docker-recommended)
    - [Running Locally Without Docker](#running-locally-without-docker)
  - [Production](#production)
    - [Building and Running the Production Container](#building-and-running-the-production-container)
    - [Manual Production Build](#manual-production-build)
  - [Architecture](#architecture)
  - [API Endpoints](#api-endpoints)
  - [Docker Configuration](#docker-configuration)
  - [Continuous Integration and Deployment (CI/CD)](#continuous-integration-and-deployment-cicd)
    - [CI/CD Workflow](#cicd-workflow)
    - [Setup Instructions](#setup-instructions)
    - [GitHub Actions Files](#github-actions-files)

## Getting Started

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/drewclark/drewclark.io-portfolio.git
cd drewclark.io-portfolio
npm install
```

## Running the Application

The simplest way to run the application is:

```bash
# Full system with vector search
npm run dev:full

# Minimal system without vector search
npm run dev:minimal
```

For detailed instructions on starting the development environment, see the [DEV-STARTUP-GUIDE.md](./DEV-STARTUP-GUIDE.md).

## AI Code Embedding System

This portfolio features an advanced AI embedding system that enables semantic understanding of code repositories. The system processes GitHub repositories, creates vector embeddings, and allows the AI to reference specific code sections when answering questions.

### System Architecture

The code embedding system follows this pipeline:

1. **Repository Discovery**: The system reads repositories listed in `git_repos.txt`.
2. **Repository Cloning**: The system clones repositories to local storage (`data/repositories/`).
3. **Code Processing**: Code files are parsed into semantic units (functions, classes, etc.).
4. **Chunking**: Large units are chunked with a 30% overlap to maintain context across chunk boundaries.
5. **Embedding Generation**: OpenAI embeddings are generated for each chunk.
6. **Vector Storage**: Embeddings are stored in a Qdrant vector database.
7. **Context Retrieval**: When users ask questions, the system finds relevant code snippets.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Repository     │────▶│  Code Parsing   │────▶│  Code Chunking  │
│  Discovery      │     │  & Processing   │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  AI Response    │◀────│ Context         │◀────│  Embedding      │
│  Generation     │     │ Retrieval       │     │  Generation     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Setting Up Repositories

To add new repositories to the system:

1. Add the repository URL to `git_repos.txt` in the format:
   ```
   username  https://github.com/username/repository.git (fetch)
   username  https://github.com/username/repository.git (push)
   ```

2. Restart the application or trigger repository processing:
   ```bash
   curl -X POST http://localhost:3000/api/admin/repositories/update \
     -H "Content-Type: application/json" \
     -d '{"token": "YOUR_ADMIN_TOKEN"}'
   ```

3. The system will automatically clone, process, and index the repository.

For more details, see the [REPOSITORY-INTEGRATION-GUIDE.md](./REPOSITORY-INTEGRATION-GUIDE.md).

### Troubleshooting the Embedding System

**Missing References**
If the system is missing references (e.g., "the missile" in a repository):

1. **Check Repository Processing**: Verify that the repository containing the reference is properly listed in `git_repos.txt`.

2. **Force Reprocessing**: Trigger a reprocessing to regenerate embeddings:
   ```bash
   # Clear existing embeddings for the repository
   curl -X POST http://localhost:3000/api/admin/repositories/process \
     -H "Content-Type: application/json" \
     -d '{
       "token": "YOUR_ADMIN_TOKEN",
       "repositoryUrl": "https://github.com/username/repository",
       "force": true
     }'
   ```

3. **Check Qdrant Connection**: If references are still missing, ensure Qdrant is working:
   ```bash
   curl http://localhost:6333/healthz
   ```

4. **Fix Vector ID Format**: If you encounter UUID format errors:
   ```bash
   npm run qdrant:fix-ids
   ```

**OpenAI API Issues**
If embedding generation fails:

1. Verify your OpenAI API key is correctly set in `.env`
2. Check the server logs for API rate limiting or errors
3. Temporarily, the system will fall back to mock embeddings for development

## Running Tests

To run tests:

```bash
npm test
```

## Deployment

Instructions for deploying the application.

## License

This project is licensed under the MIT License.

## Containerized Application

This application has been containerized with Docker, which simplifies deployment and ensures consistency across environments.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- OpenAI API Key

### Environment Variables

#### OpenAI API Key Setup

This project requires an OpenAI API key to enable the AI assistant functionality.

**Option 1: Using .env File (Root Directory)**

Create a `.env` file in the root directory with the following:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Option 2: Using Environment-Specific Files (API Directory)**

For development, copy the template file:

```bash
# Copy the template
cp api/.env.development.template api/.env.development

# Edit the file and add your API key
```

**Option 3: System Environment Variable**

Set the `OPENAI_API_KEY` environment variable directly in your system.

**Option 4: Docker Environment Variable**

When using Docker, you can pass the environment variable at runtime:

```bash
OPENAI_API_KEY=your_key_here docker-compose up dev
```

> **Security Note**: Never commit your API keys to version control. All `.env*` files are ignored in `.gitignore`.

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
- Expose the application on <http://localhost:3000>

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
- Expose the application on <http://localhost:3000>

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
    - Manages repository cloning and embedding generation
    - Interfaces with Qdrant vector database

## API Endpoints

- `GET /api/askGPT`: Health check endpoint
- `POST /api/askGPT`: Send questions to OpenAI
- `POST /api/admin/repositories/update`: Trigger repository update
- `POST /api/admin/repositories/process`: Process a specific repository
- `GET /api/health`: General health check

Example request:

```json
{
    "question": "Tell me about Drew Clark's portfolio",
    "repositoryUrl": "https://github.com/drewclark/drewclark.io-portfolio", 
    "model": "gpt-3.5-turbo", // optional
    "temperature": 0.7, // optional
    "maxTokens": 500 // optional
}
```

## Docker Configuration

- `Dockerfile`: Production container configuration
- `Dockerfile.dev`: Development container with hot reloading
- `docker-compose.yml`: Service definitions for both dev and production
- `docker-compose-qdrant.yml`: Configuration for the Qdrant vector database

## Continuous Integration and Deployment (CI/CD)

This project uses GitHub Actions for continuous integration and deployment.

### CI/CD Workflow

The workflow automatically:

1. Builds and tests the application
2. Pushes Docker images to Docker Hub

### Setup Instructions

To set up CI/CD for this project:

1. Push the code to a GitHub repository
2. Configure the required secrets in your GitHub repository:
    - `DOCKERHUB_USERNAME`: Your Docker Hub username
    - `DOCKERHUB_TOKEN`: Docker Hub access token
    - `OPENAI_API_KEY`: OpenAI API key

For detailed setup instructions, see the [CI-CD-SETUP.md](./CI-CD-SETUP.md) file.

### GitHub Actions Files

- `.github/workflows/ci-cd.yml`: Main CI/CD workflow definition

![CI/CD Pipeline](https://via.placeholder.com/1200x400?text=CI%2FCD+Pipeline)
