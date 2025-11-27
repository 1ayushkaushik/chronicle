// Example: Real OpenAI Integration
// File: src/services/aiService.ts

const generateContinuation = async (currentText: string): Promise<string> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `Continue this text naturally: "${currentText}"`
        }],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    throw new Error('Failed to generate AI continuation');
  }
};

// Example: Anthropic Claude Integration
const generateContinuation = async (currentText: string): Promise<string> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Please continue this text in a natural way: "${currentText}"`
        }]
      })
    });

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    throw new Error('Failed to generate AI continuation');
  }
};

export default { generateContinuation };