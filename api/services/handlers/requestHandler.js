/**
 * Chat request handler (/api/askGPT)
 *
 * Validates the visitor's question, finds the matching code in the project
 * repos, and asks the model to answer from the project data plus that code.
 * Visitors only ever see short, friendly errors; details go to the server log.
 */

const { getChatCompletion } = require('../ai/openaiService');
const { buildChatMessages, findProject, searchableRepos, repoLabel } = require('../ai/promptBuilder');
const { searchCode } = require('../codeIndex/codeSearch');
const { checkCache, cacheResponse, generateCacheKey } = require('../cache/cacheService');
const config = require('../../config');

const UNAVAILABLE = 'The assistant is unavailable right now. Please try again later.';
const SOMETHING_WENT_WRONG = 'Something went wrong. Please try again.';

/**
 * Safety net: the UI renders plain text, so strip Markdown the model may still produce.
 * @param {string} text - Model output
 * @returns {string} Plain text
 */
function toPlainText(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/^```[^\n]*\n?/gm, '')       // ``` code fences (the code itself stays)
    .replace(/\*\*(.+?)\*\*/g, '$1')      // **bold**
    .replace(/`([^`\n]+)`/g, '$1')         // `code`
    .replace(/^#{1,6}\s+/gm, '')          // # headings
    .replace(/^(\s*)[-*]\s+/gm, '$1• ');  // - bullets
}

/**
 * Where a code excerpt came from, with a link to those lines on GitHub
 * @param {Object} excerpt - Result from searchCode()
 * @returns {{project: string, file: string, lines: string, url: string}}
 */
function toSource(excerpt) {
  const { repo, path, startLine, endLine, commit } = excerpt;
  return {
    project: repoLabel(repo),
    file: path,
    lines: `${startLine}-${endLine}`,
    url: `https://github.com/${repo}/blob/${commit}/${encodeURI(path)}#L${startLine}-L${endLine}`
  };
}

/**
 * What the visitor sees when the OpenAI call fails
 * @param {Error} error - Error from getChatCompletion()
 * @returns {{status: number, body: Object}}
 */
function openAiErrorResponse(error) {
  const message = error.message || '';
  if (message.includes('Rate limit')) {
    return { status: 429, body: { error: 'The assistant is busy right now. Please try again in a minute.' } };
  }
  if (message.includes('Invalid request')) {
    return { status: 400, body: { error: "The assistant couldn't answer that. Please try rephrasing your question." } };
  }
  if (message.includes('Authentication error')) {
    return { status: 503, body: { error: UNAVAILABLE } };
  }
  return { status: 500, body: { error: SOMETHING_WENT_WRONG } };
}

async function handlePostRequest(req, createResponse, logger) {
  const { logInfo, logError, logWarn } = logger;

  // Validate input
  if (!req.body || typeof req.body.question !== 'string' || req.body.question.trim() === '') {
    return createResponse(400, {}, { error: 'Please type a question.' });
  }
  if (req.body.question.trim().length > config.chat.maxQuestionChars) {
    return createResponse(400, {}, {
      error: `Please keep questions under ${config.chat.maxQuestionChars} characters.`
    });
  }

  // Optional: answer about one project only
  let project = null;
  if (req.body.projectId !== undefined && req.body.projectId !== null) {
    project = findProject(req.body.projectId);
    if (!project) {
      return createResponse(400, {}, { error: 'Unknown project.' });
    }
  }

  // Used as-is: answers are rendered as text, never HTML
  const userQuestion = req.body.question.trim();
  logInfo(`Question: "${userQuestion.substring(0, 50)}${userQuestion.length > 50 ? '...' : ''}"`);

  // Model and limits are fixed on the server; anything the client sends is ignored
  const { model: modelName, temperature, maxTokens } = config.chat;

  // Identical questions about the same project are answered from the cache
  const cacheKey = generateCacheKey(userQuestion.toLowerCase(), modelName, temperature, maxTokens, project ? String(project.id) : 'all');
  const cachedResponse = checkCache(cacheKey);
  if (cachedResponse) {
    logInfo('Cache hit for question');
    return createResponse(200, {}, { ...cachedResponse, cached: true });
  }

  if (!config.openAiApiKey) {
    logWarn('OPENAI_API_KEY is not set, so the chat cannot answer');
    return createResponse(503, {}, {
      error: config.isDevelopment ? 'OPENAI_API_KEY is not set on the server.' : UNAVAILABLE
    });
  }

  // The code that best matches the question, from the project's repo (or every repo
  // for general questions). If the search is unavailable, answer from the descriptions.
  let excerpts = [];
  try {
    excerpts = await searchCode(userQuestion, searchableRepos(project));
    logInfo(`Code search: ${excerpts.length} excerpt(s)`);
  } catch (error) {
    logWarn(`Code search unavailable, answering from project descriptions only: ${error.message}`);
  }

  try {
    const response = await getChatCompletion({
      model: modelName,
      messages: buildChatMessages({ question: userQuestion, project, excerpts }),
      temperature,
      maxTokens,
      logInfo,
      logError
    });

    const answer = toPlainText(response.answer);
    const sources = excerpts.map(toSource);
    cacheResponse(cacheKey, { answer, sources });

    return createResponse(200, {}, {
      answer,
      sources,
      metrics: {
        apiCallDurationMs: response.duration,
        codeExcerpts: excerpts.length,
        tokenUsage: response.usage
      }
    });
  } catch (error) {
    logError(`Error calling OpenAI: ${error.message}`);
    const { status, body } = openAiErrorResponse(error);
    return createResponse(status, {}, body);
  }
}

/**
 * Handle a chat request. Only POST is supported; CORS preflights are answered
 * by the server before requests get here.
 * @param {Object} params
 * @param {Object} params.req - HTTP request
 * @param {Function} params.createResponse - (status, headers, body) => response
 * @param {Function} params.logInfo
 * @param {Function} params.logError
 * @param {Function} params.logWarn
 * @returns {Promise<Object>} Response
 */
async function handleRequest({ req, createResponse, logInfo, logError, logWarn }) {
  if (req.method !== 'POST') {
    return createResponse(405, { Allow: 'POST' }, { error: 'Use POST with a JSON body containing a question.' });
  }
  try {
    return await handlePostRequest(req, createResponse, { logInfo, logError, logWarn });
  } catch (error) {
    logError(`Unhandled error: ${error.stack || error.message}`);
    return createResponse(500, {}, { error: SOMETHING_WENT_WRONG });
  }
}

module.exports = { handleRequest };
