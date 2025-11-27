import React from 'react';
import Editor from '../Editor';
import ContinueButton from '../ContinueButton';
import { useMachine } from '@xstate/react';
import editorMachine from '../../machines/editorMachine';
import aiService from '../../services/aiService';
import './../../styles/globals.css';

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

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Chronicle</h1>
        <p className="app-subtitle">AI-Powered Writing Assistant</p>
        <div className="status-indicator">
          <div className="status-dot"></div>
          AI Ready
        </div>
      </header>

      <div className="editor-container">
        <Editor 
          value={state.context.text} 
          onChange={handleTextChange} 
        />
        
        <div className="controls-section">
          <div className="word-counter">
            <span>📝</span>
            {getWordCount(state.context.text)} words • {state.context.text.length} characters
          </div>
          
          <ContinueButton 
            onClick={handleContinueWriting}
            isLoading={state.matches('loading')} 
          />
        </div>

        {state.matches('loading') && (
          <div className="status-message loading">
            <div className="loading-spinner"></div>
            AI is crafting your continuation...
          </div>
        )}
        
        {state.context.error && (
          <div className="status-message error">
            ⚠️ Error: {state.context.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;