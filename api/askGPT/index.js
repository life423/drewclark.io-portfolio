const { OpenAI } = require('openai');

module.exports = async function (context, req) {
    // Log function invocation
    context.log('askGPT function invoked.');
    
    // Set response headers for CORS
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers,
            body: {}
        };
        return;
    }

    // Check if it's a GET request (for simple health check)
    if (req.method === 'GET') {
        context.res = {
            status: 200,
            headers,
            body: { message: 'askGPT is alive! Use POST with a JSON body containing a "question" field.' }
        };
        return;
    }
    
    // Ensure this is a POST request
    if (req.method !== 'POST') {
        context.res = {
            status: 405,
            headers,
            body: { error: 'Method not allowed. Use POST to ask a question.' }
        };
        return;
    }
    
    // Validate input - ensure we have a question and it's a string
    if (!req.body || typeof req.body.question !== 'string' || req.body.question.trim() === '') {
        context.res = {
            status: 400,
            headers,
            body: { error: 'Missing or invalid question parameter. Please provide a non-empty question string.' }
        };
        return;
    }
    
    // Get the question from the request body
    const userQuestion = req.body.question.trim();
    
    try {
        // Get API key from environment variables
        const apiKey = process.env.OPENAI_API_KEY;
        
        // Check if API key is provided
        if (!apiKey || apiKey === 'your-api-key-here') {
            context.log.error('Missing OpenAI API key. Please set the OPENAI_API_KEY environment variable.');
            
            // For development, return a mock response if no API key is available
            context.res = {
                status: 200,
                headers,
                body: { 
                    answer: `[DEVELOPMENT MODE] OpenAI API key not configured. Your question was: "${userQuestion}"`,
                    note: "To use the real GPT model, set your OPENAI_API_KEY in Application Settings."
                }
            };
            return;
        }
        
        // Initialize the OpenAI client
        const openai = new OpenAI({ apiKey });
        
        // Call the OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Use gpt-4 for higher quality but more expensive responses
            messages: [
                { role: "system", content: "You are a helpful assistant answering questions for Drew Clark's portfolio website visitors. Keep responses concise, informative, and friendly." },
                { role: "user", content: userQuestion }
            ],
            max_tokens: 500,
            temperature: 0.7
        });
        
        // Get the response text
        const answer = response.choices[0].message.content;
        
        // Return the answer
        context.res = {
            status: 200,
            headers,
            body: { answer }
        };
    } catch (error) {
        // Log the error for debugging
        context.log.error(`Error processing request: ${error.message}`);
        context.log.error(error);
        
        // Return an appropriate error response
        context.res = {
            status: 500,
            headers,
            body: { 
                error: 'An error occurred while processing your request.',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later.'
            }
        };
    }
};
