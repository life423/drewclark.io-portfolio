/**
 * Chat API client
 *
 * Sends a visitor's question to the server, which answers from the project
 * descriptions and the matching code in each project's repo. Resolves to the
 * answer plus the code it drew on; it never throws, so the chat can always
 * show something.
 */
const ENDPOINT = import.meta.env.VITE_API_URL || '/api/askGPT'
const TIMEOUT_MS = 30000
const SERVER_TROUBLE = 'Sorry, something went wrong on my end. Please try again in a moment.'

/**
 * @param {string} question
 * @returns {Promise<{answer: string, sources: Array<{project: string, file: string, lines: string, url: string}>}>}
 */
export async function askProjectsChat(question) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
            signal: controller.signal,
        })
        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
            // Messages for 4xx errors (rate limits, question too long) are written for visitors
            return { answer: response.status < 500 && data.error ? data.error : SERVER_TROUBLE, sources: [] }
        }
        return {
            answer: data.answer || SERVER_TROUBLE,
            sources: Array.isArray(data.sources) ? data.sources : [],
        }
    } catch (error) {
        return {
            answer:
                error.name === 'AbortError'
                    ? 'That took too long to answer. Please try again.'
                    : "I couldn't reach the server. Please check your connection and try again.",
            sources: [],
        }
    } finally {
        clearTimeout(timer)
    }
}
