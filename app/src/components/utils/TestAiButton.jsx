import React, { useState } from 'react';
import { askGeneralQuestion } from '../../services/aiGenerationService';

function TestAiButton() {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('What is this portfolio about?');

  const handleTest = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const response = await askGeneralQuestion(question);
      setAnswer(response);
    } catch (error) {
      console.error("Error:", error);
      setAnswer("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-brandGray-700 rounded-lg bg-brandGray-800">
      <h3 className="text-xl font-bold text-brandGreen-300 mb-3">AI Response Test</h3>
      
      <div className="mb-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-3 py-2 bg-brandGray-700 border border-brandGray-600 rounded-lg text-sm text-white"
          rows="2"
          placeholder="Ask a question..."
        />
      </div>
      
      <button 
        onClick={handleTest} 
        disabled={loading}
        className="px-4 py-2 bg-brandGreen-500 text-white rounded-lg hover:bg-brandGreen-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generating...' : 'Test AI Response'}
      </button>
      
      {answer && (
        <div className="mt-4 p-3 bg-brandGray-700 border-l-2 border-neonOrange-500 rounded-lg">
          <p className="text-sm text-brandGray-200">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default TestAiButton;
