# AI-Assisted Editor

A React-based text editor with AI assistance capabilities, built using TypeScript, XState for state management, and ProseMirror for rich text editing.

## Features

- Rich text editing with ProseMirror
- AI-powered text continuation
- State management with XState
- TypeScript for type safety
- Clean component architecture

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **XState** - State management
- **ProseMirror** - Rich text editor
- **React Scripts** - Build tooling

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/         # React components
│   ├── Editor/        # ProseMirror editor component
│   ├── ContinueButton/ # AI continue button
│   └── App/           # Main app component
├── hooks/             # Custom React hooks
├── machines/          # XState machines
├── services/          # External services (AI API)
├── styles/           # CSS styles
└── types/            # TypeScript type definitions
```

## How It Works

1. **Editor Component**: Uses ProseMirror for rich text editing with a clean interface
2. **State Management**: XState manages the application state including text content, loading states, and errors
3. **AI Service**: Mock service that simulates AI text generation (replace with real AI API)
4. **Continue Writing**: Button triggers AI to continue writing based on current text content

## State Machine

The editor uses an XState machine with the following states:
- `idle`: Ready for user input
- `loading`: AI is generating text

Events:
- `UPDATE_TEXT`: Updates the text content
- `CONTINUE_WRITING`: Triggers AI generation
- `SET_AI_RESPONSE`: Receives AI response
- `SET_ERROR`: Handles errors

## Customization

### Replace AI Service

To integrate with a real AI API, modify `src/services/aiService.ts`:

```typescript
const generateContinuation = async (currentText: string): Promise<string> => {
  const response = await fetch('/api/ai/continue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: currentText })
  });
  
  const data = await response.json();
  return data.continuation;
};
```

### Extend Editor Features

Add more ProseMirror plugins in `src/components/Editor/Editor.tsx`:

```typescript
import { history } from 'prosemirror-history';
import { inputRules } from 'prosemirror-inputrules';

const editorState = EditorState.create({
  schema,
  plugins: [
    keymap(baseKeymap),
    history(),
    inputRules({ rules: [] })
  ]
});
```

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## License

This project is for educational/demonstration purposes.