# AI Backend Server

This backend server securely handles AI API calls to keep your API keys safe from the frontend.

## Setup

1. **Install dependencies:**
   ```bash
   cd ai-backend
   npm install
   ```

2. **Get Groq API Key:**
   - Go to [console.groq.com](https://console.groq.com)
   - Sign up (free)
   - Create API key
   - Replace `YOUR_NEW_GROQ_API_KEY` in `server.js`

3. **Start the server:**
   ```bash
   npm start
   # or for development:
   npm run dev
   ```

4. **Test the server:**
   - Open: http://localhost:3001/api/health
   - Should see: `{"status":"Backend running successfully"}`

## Security Features

- ✅ API keys hidden from frontend code
- ✅ CORS enabled for React app
- ✅ Input validation
- ✅ Error handling
- ✅ Health check endpoint

## API Endpoints

### POST /api/groq
Continue text using Groq AI

**Request:**
```json
{
  "currentText": "The future of technology is"
}
```

**Response:**
```json
{
  "text": " bright and full of possibilities.",
  "success": true
}
```

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "Backend running successfully"
}
```

## Usage with Frontend

Your React app is already configured to use this backend. Just:

1. Start this backend server: `npm start`
2. Start your React app: `npm start`
3. The AI will work through the secure backend!

## Environment Variables (Optional)

For production, use environment variables:

1. Create `.env` file:
   ```
   GROQ_API_KEY=your_actual_api_key_here
   PORT=3001
   ```

2. Update `server.js`:
   ```js
   "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
   ```