#!/usr/bin/env node

const { httpRequest, log } = require('./utils')

async function testQdrantApi() {
    console.log('Testing Qdrant API connection...')

    try {
        // Test the collections endpoint
        const response = await httpRequest(
            'http://localhost:6333/collections',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        )

        console.log('Response status:', response.statusCode)
        console.log('Response headers:', response.headers)
        console.log('Response data type:', typeof response.data)
        console.log('Raw response data:', response.data)

        // Try to parse the data if needed
        try {
            const parsedData =
                typeof response.data === 'string'
                    ? JSON.parse(response.data)
                    : response.data

            console.log('Parsed data:', JSON.stringify(parsedData, null, 2))
        } catch (err) {
            console.error('Failed to parse data:', err.message)
        }

        console.log('Test completed successfully!')
    } catch (error) {
        console.error('Test failed:', error.message)
    }
}

testQdrantApi().catch(console.error)
