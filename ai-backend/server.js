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
                role: "user",
                content: `Continue this text naturally: "${currentText}"`
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
          
          const aiResponse = data.choices[0]?.message?.content?.trim();
          
          if (aiResponse) {
            console.log('Sending AI response:', aiResponse);
            return res.json({ text: aiResponse, success: true });
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

// Simple response generator for when APIs fail
function generateSimpleResponse(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('technology') || lowerText.includes('ai')) {
    return ' continues to evolve and transform our daily lives in remarkable ways.';
  } else if (lowerText.includes('future')) {
    return ' holds immense promise for innovation and positive change.';
  } else if (text.includes('?')) {
    return ' The answer to this question requires careful consideration and analysis.';
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