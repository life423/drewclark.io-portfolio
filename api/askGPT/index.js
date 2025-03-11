module.exports = async function (context, req) {
    // Safely handle missing req.body
    const userQuestion = req.body?.question || "No question provided";
    
    // TODO: Call OpenAI GPT-4 with your API key
    // const answer = await callOpenAI(userQuestion);

    context.res = {
        status: 200,
        body: { answer: `Mocked AI response: you asked "${userQuestion}"` },
    }
}
