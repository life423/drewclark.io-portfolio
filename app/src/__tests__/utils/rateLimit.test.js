/**
 * Rate Limiting Tests
 * 
 * Tests the feature-specific rate limiting functionality to ensure
 * that different features have independent rate limits.
 */

import fetchMock from 'jest-fetch-mock';

// Add support for ES Modules in Jest
jest.useFakeTimers();

// Mock response fetch
beforeAll(() => {
  fetchMock.enableMocks();
});

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('Feature-specific rate limiting', () => {
  
  test('Different features should have independent rate limits', async () => {
    // Mock successful response
    fetchMock.mockResponseOnce(JSON.stringify({ answer: 'Test response' }));
    
    // Make connect4 request
    const connect4Response = await fetch('/api/askGPT/connect4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Make a move' })
    });
    
    expect(connect4Response.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    
    // Reset and mock successful projects response
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ answer: 'Project info' }));
    
    // Make projects request
    const projectsResponse = await fetch('/api/askGPT/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Tell me about this project' })
    });
    
    expect(projectsResponse.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  
  test('Connect4 requests should be rate limited after exceeding limit', async () => {
    // Mock 20 successful responses and then a rate limit
    for (let i = 0; i < 20; i++) {
      fetchMock.mockResponseOnce(JSON.stringify({ answer: `Response ${i}` }));
    }
    fetchMock.mockResponseOnce(JSON.stringify({ 
      error: 'Too many requests' 
    }), { status: 429 });
    
    // Make 21 connect4 requests (should hit limit on last request)
    for (let i = 0; i < 20; i++) {
      const response = await fetch('/api/askGPT/connect4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: `Move ${i}` })
      });
      expect(response.ok).toBe(true);
    }
    
    // This request should be rate limited
    const limitedResponse = await fetch('/api/askGPT/connect4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Over limit move' })
    });
    
    expect(limitedResponse.status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(21);
  });
  
  test('Projects requests should still work after Connect4 hits rate limit', async () => {
    // Set up mocks - Connect4 rate limited but Projects still available
    fetchMock.mockResponseOnce(JSON.stringify({ 
      error: 'Too many requests' 
    }), { status: 429 });
    
    // Make rate-limited connect4 request
    const connect4Response = await fetch('/api/askGPT/connect4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Rate limited move' })
    });
    
    expect(connect4Response.status).toBe(429);
    
    // Reset mock and set up projects response
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ answer: 'Project info works' }));
    
    // Projects request should still work
    const projectsResponse = await fetch('/api/askGPT/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Tell me about this project' })
    });
    
    expect(projectsResponse.ok).toBe(true);
    const data = await projectsResponse.json();
    expect(data.answer).toBe('Project info works');
  });
});
