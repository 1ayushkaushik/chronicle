# Chronicle - AI-Assisted Editor

A modern, AI-powered text editor built with React, TypeScript, XState, and ProseMirror.

## 🚀 Features

- **Rich Text Editing** - ProseMirror-powered editor with formatting
- **AI-Powered Continuations** - Groq AI integration for intelligent text generation
- **State Management** - XState for predictable state transitions
- **Modern UI** - Beautiful glassmorphism design with animations
- **Secure API** - Backend server protects API keys

## 🏗️ Architecture

```
chronicle/
├── ai-assisted-editor/     # React frontend
└── ai-backend/            # Express backend
```

## 🛠️ Setup Instructions

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd chronicle
```

### 2. Backend Setup
```bash
cd ai-backend
npm install
```

Create `.env` file:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
GROQ_MODEL=llama-3.3-70b-versatile
```

Start backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ai-assisted-editor
npm install
npm start
```

## 🔑 Getting API Keys

1. **Groq API** (Free):
   - Visit [console.groq.com](https://console.groq.com)
   - Create account and get API key
   - Add to backend `.env` file

## 🎯 Technical Stack

- **Frontend**: React 18, TypeScript, XState, ProseMirror
- **Backend**: Node.js, Express, Groq AI API
- **Styling**: Modern CSS with glassmorphism effects
- **State Management**: XState finite state machines

## 🚀 Usage

1. Type text in the editor
2. Click "Continue Writing" to get AI-powered text continuation
3. Enjoy seamless writing assistance!

## 🛡️ Security

- API keys stored in environment variables
- Backend proxy protects sensitive credentials
- CORS configured for frontend-backend communication

## 📝 License

MIT License - feel free to use and modify!