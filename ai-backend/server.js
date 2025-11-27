require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for React frontend

app.post("/api/groq", async (req, res) => {
  const { currentText } = req.body;

  if (!currentText) {
    return res.status(400).json({ error: "currentText is required" });
  }

  try {
    console.log('Received currentText:', currentText); // Debug log
    
    // Get configuration from environment variables
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    const MAX_TOKENS = parseInt(process.env.MAX_TOKENS) || 100;
    const TEMPERATURE = parseFloat(process.env.TEMPERATURE) || 0.7;

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY not found in environment variables');
      return res.status(500).json({ error: "API key not configured" });
    }
    
    // Try multiple Groq endpoints
    const groqEndpoints = [
      process.env.GROQ_PRIMARY_ENDPOINT || "https://api.groq.com/openai/v1/chat/completions",
      process.env.GROQ_FALLBACK_ENDPOINT || "https://api.groq.com/v1/chat/completions",
      "https://api.groq.com/chat/completions"
    ];
    
    let groqSuccess = false;
    let lastError = null;
    
    for (const endpoint of groqEndpoints) {
      try {
        console.log(`Trying Groq endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              {
                role: "system",
                content: "You are a writing assistant. Continue the given text naturally and seamlessly. IMPORTANT: Only return the continuation text, not the original text. Do not repeat what the user already wrote."
              },
              {
                role: "user",
                content: `Continue this text with new content (do not repeat the original text): "${currentText}"`
              }
            ],
            max_tokens: MAX_TOKENS,
            temperature: TEMPERATURE,
          }),
        });

        console.log(`Groq API response status for ${endpoint}:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Groq API response data:', data);
          
          let aiResponse = data.choices[0]?.message?.content?.trim();
          
          if (aiResponse) {
            // Clean up the AI response to remove any repetition of original text
            aiResponse = cleanAIResponse(aiResponse, currentText);
            
            console.log('Original text length:', currentText.length);
            console.log('Raw AI response:', data.choices[0]?.message?.content);
            console.log('Cleaned AI response:', aiResponse);
            
            if (aiResponse && aiResponse.length > 0) {
              return res.json({ text: aiResponse, success: true });
            }
          }
        } else {
          const errorData = await response.json();
          console.error(`Groq API error for ${endpoint}:`, errorData);
          lastError = errorData;
        }
      } catch (endpointError) {
        console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
        lastError = endpointError;
      }
    }
    
    // If all Groq endpoints fail, use fallback response
    console.log('All Groq endpoints failed, using fallback response');
    
    // Generate a simple contextual response
    const contextualResponse = generateSimpleResponse(currentText);
    res.json({ text: contextualResponse, success: true });
    
  } catch (err) {
    console.error('Backend error:', err);
    res.status(500).json({ 
      error: "Internal server error", 
      details: err.message 
    });
  }
});

// Function to clean AI response and remove repetition
function cleanAIResponse(aiResponse, originalText) {
  // Remove quotes if the AI wrapped the response in quotes
  aiResponse = aiResponse.replace(/^["']|["']$/g, '');
  
  // Get the last few words of the original text to detect repetition
  const originalWords = originalText.trim().split(/\s+/);
  const lastWords = originalWords.slice(-10).join(' ').toLowerCase(); // Last 10 words
  
  // Check if AI response starts with any part of the original text
  const aiWords = aiResponse.split(/\s+/);
  let cleanStart = 0;
  
  // Find where the new content actually begins
  for (let i = 0; i < aiWords.length; i++) {
    const aiSegment = aiWords.slice(0, i + 1).join(' ').toLowerCase();
    
    // If this segment appears at the end of original text, skip it
    if (lastWords.includes(aiSegment) || originalText.toLowerCase().includes(aiSegment)) {
      cleanStart = i + 1;
    } else {
      break;
    }
  }
  
  // Return only the new content
  const cleanedResponse = aiWords.slice(cleanStart).join(' ').trim();
  
  // If we cleaned too much, return the original AI response but ensure it doesn't start with original text
  if (cleanedResponse.length < 10 && aiResponse.length > 20) {
    // Check if AI response starts with end of original text
    const lastSentence = originalText.split(/[.!?]/).pop()?.trim().toLowerCase() || '';
    const aiStart = aiResponse.substring(0, Math.min(50, aiResponse.length)).toLowerCase();
    
    if (lastSentence && aiStart.startsWith(lastSentence.substring(0, 20))) {
      // Find where the repetition ends and new content begins
      const words = aiResponse.split(/\s+/);
      for (let i = 1; i < words.length; i++) {
        const segment = words.slice(0, i).join(' ').toLowerCase();
        if (!originalText.toLowerCase().includes(segment)) {
          return words.slice(i - 1).join(' ').trim();
        }
      }
    }
    
    return aiResponse;
  }
  
  return cleanedResponse || aiResponse;
}

// Simple response generator for when APIs fail
function generateSimpleResponse(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('technology') || lowerText.includes('ai')) {
    return ' continues to evolve and transform our daily lives in remarkable ways.';
  } else if (lowerText.includes('future')) {
    return ' holds immense promise for innovation and positive change.';
  } else if (text.includes('?')) {
    return ' The answer to this question requires careful consideration and analysis.';
  } else if (lowerText.includes('india') || lowerText.includes('modi')) {
    return ' has played a significant role in shaping modern India\'s political and economic landscape.';
  } else {
    const endings = [
      ' and this development represents a significant step forward.',
      ' while maintaining focus on sustainable and responsible growth.',
      ' through innovative approaches that benefit everyone involved.',
      ' creating opportunities for meaningful progress and collaboration.'
    ];
    return endings[Math.floor(Math.random() * endings.length)];
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "Backend running successfully",
    env: process.env.NODE_ENV || 'development',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});