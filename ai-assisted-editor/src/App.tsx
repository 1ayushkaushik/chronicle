import React from 'react';
import Editor from './components/Editor';
import ContinueButton from './components/ContinueButton';
import { useMachine } from '@xstate/react';
import editorMachine from './machines/editorMachine';
import aiService from './services/aiService';
import './styles/globals.css';

const App: React.FC = () => {
  const [state, send] = useMachine(editorMachine);

  const handleTextChange = (text: string) => {
    send({ type: 'UPDATE_TEXT', text });
  };

  const handleContinueWriting = async () => {
    send({ type: 'CONTINUE_WRITING' });
    try {
      const aiResponse = await aiService.generateContinuation(state.context.text);
      send({ type: 'SET_AI_RESPONSE', text: aiResponse });
    } catch (error) {
      send({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>AI-Assisted Editor</h1>
      <p>Current text length: {state.context.text.length}</p>
      <Editor 
        value={state.context.text} 
        onChange={handleTextChange} 
      />
      <ContinueButton 
        onClick={handleContinueWriting}
        isLoading={state.matches('loading')} 
      />
      {state.matches('loading') && (
        <p style={{ marginTop: '10px', color: '#666' }}>
          AI is generating content...
        </p>
      )}
      {state.context.error && (
        <p style={{ marginTop: '10px', color: '#e74c3c' }}>
          Error: {state.context.error}
        </p>
      )}
    </div>
  );
};

export default App;