// Free AI service using Ollama local API
// No signup required - runs AI models locally on your machine

const generateContinuation = async (currentText: string): Promise<string> => {
  try {
    console.log('Attempting to use local Ollama API...');
    
    // Try local Ollama first (if installed)
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2', // Free model
        prompt: `Continue this text naturally and seamlessly. Only provide the continuation, not the original text:\n\n"${currentText}"`,
        stream: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const continuation = data.response?.trim();
      if (continuation) {
        console.log('Ollama local AI success!');
        return continuation;
      }
    }
  } catch (error) {
    console.log('Local Ollama not available, trying alternative...');
  }

  try {
    // Try backend AI service (Groq via your backend)
    console.log('Trying backend AI service...');
    console.log('Sending to backend:', { currentText }); // Debug log
    
    const response = await fetch('http://localhost:3001/api/groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentText: currentText
      }),
    });

    console.log('Backend response status:', response.status); // Debug log

    if (response.ok) {
      const data = await response.json();
      console.log('Backend response data:', data); // Debug log
      
      if (data.success && data.text) {
        console.log('Backend AI service success!');
        return data.text.trim();
      }
    } else {
      // Log the actual error response
      const errorData = await response.json();
      console.error('Backend error details:', errorData);
    }
  } catch (error) {
    console.error('Backend AI service error:', error);
  }

  try {
    // Fallback: Try free public AI endpoint
    console.log('Trying DeepAI service...');
    
    const response = await fetch('https://api.deepai.org/api/text-generator', {
      method: 'POST',
      headers: {
        'Api-Key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K', // Free tier key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Continue writing: ${currentText}`
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const result = data.output?.trim();
      if (result && result !== currentText) {
        console.log('DeepAI success!');
        // Remove the original text if it was included
        const continuation = result.replace(currentText, '').trim();
        return continuation || result;
      }
    }
  } catch (error) {
    console.log('DeepAI failed, using intelligent fallback...');
  }

  // Final fallback: Use context-aware response
  return generateContextAwareResponse(currentText);
};

// Intelligent context-aware fallback (no API needed)
const generateContextAwareResponse = (text: string): string => {
  console.log('Using intelligent context-aware response generator...');
  
  const lowerText = text.toLowerCase();
  const words = text.trim().split(/\s+/);
  const lastWord = words[words.length - 1]?.toLowerCase().replace(/[.,!?;:]/, '') || '';
  
  // Analyze content for smart responses
  if (lowerText.includes('technology') || lowerText.includes('ai') || lowerText.includes('innovation')) {
    const techResponses = [
      ' continues to reshape industries and create new possibilities for human advancement.',
      ' represents a fundamental shift in how we approach complex challenges.',
      ' opens doors to solutions that were previously beyond our imagination.',
      ' enables unprecedented collaboration between human creativity and computational power.'
    ];
    return techResponses[Math.floor(Math.random() * techResponses.length)];
  }
  
  if (lowerText.includes('future') || lowerText.includes('tomorrow') || lowerText.includes('ahead')) {
    const futureResponses = [
      ' holds immense potential for positive transformation and meaningful progress.',
      ' will be shaped by the thoughtful decisions we make in this crucial moment.',
      ' depends on our collective wisdom and commitment to sustainable innovation.',
      ' promises opportunities that current limitations cannot constrain.'
    ];
    return futureResponses[Math.floor(Math.random() * futureResponses.length)];
  }
  
  if (text.includes('?')) {
    const questionResponses = [
      ' This question invites deep reflection and opens pathways to greater understanding.',
      ' The answer emerges through careful consideration of multiple perspectives.',
      ' Such inquiries often reveal insights that transform our entire approach.'
    ];
    return questionResponses[Math.floor(Math.random() * questionResponses.length)];
  }
  
  // Grammar-aware responses
  if (lastWord === 'the') {
    return ' most important factor in determining long-term success and sustainability.';
  } else if (lastWord === 'is' || lastWord === 'was') {
    return ' fundamentally transforming our understanding of what\'s possible.';
  } else if (lastWord === 'and') {
    return ' this connection reveals deeper truths about our shared experience.';
  }
  
  // Default intelligent responses
  const smartDefaults = [
    ' and this development opens new pathways for exploration and discovery.',
    ' while maintaining careful balance between innovation and responsibility.',
    ' through approaches that honor both creativity and practical wisdom.',
    ' in ways that create lasting value for current and future generations.',
    ' by fostering collaboration that amplifies our collective potential.'
  ];
  
  return smartDefaults[Math.floor(Math.random() * smartDefaults.length)];
};

const aiService = {
  generateContinuation
};

export default aiService;
export { generateContinuation };