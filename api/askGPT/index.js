module.exports = async function (context, req) {
    const userQuestion = req.body.question
    // TODO: Call OpenAI GPT-4 with your API key
    // const answer = await callOpenAI(userQuestion);

    context.res = {
        status: 200,
        body: { answer: 'Mocked AI response here' },
    }
}
