module.exports = async function (context, req) {
    // Log something so we can see it in Azure logs
    context.log('askGPT function invoked.')

    // If the request method is POST, let's parse the body.
    // This ensures a GET request in the browser won't blow up.
    if (req.method === 'POST') {
        const userQuestion =
            (req.body && req.body.question) || 'No question provided'
        context.res = {
            status: 200,
            body: { answer: `Mocked AI response: you asked "${userQuestion}"` },
        }
    } else {
        // If it’s a GET (like hitting the URL in your browser), return something simple
        context.res = {
            status: 200,
            body: { message: 'askGPT is alive! Use POST with a JSON body.' },
        }
    }
}
