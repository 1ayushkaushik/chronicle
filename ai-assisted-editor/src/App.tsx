import React from 'react';
import { useMachine } from '@xstate/react';
import { editorMachine } from './machines/editorMachine';
import Editor from './components/Editor';
import ContinueButton from './components/ContinueButton';
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
      console.error('AI service error:', error);
      send({ type: 'SET_ERROR', error: 'Failed to generate AI response. Please try again.' });
    }
  };

  const handleRetry = () => {
    send({ type: 'RETRY' });
    handleContinueWriting();
  };

  const handleClearError = () => {
    send({ type: 'CLEAR_ERROR' });
  };

  // Determine current status for UI
  const getAIStatus = () => {
    if (state.matches('loading')) return 'loading';
    if (state.matches('error')) return 'error';
    if (state.matches('success')) return 'success';
    return 'ready';
  };

  const getStatusText = () => {
    switch (getAIStatus()) {
      case 'loading': return 'AI is thinking...';
      case 'error': return `Error: ${state.context.error}`;
      case 'success': return 'AI continuation added!';
      default: return 'Ready to assist';
    }
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
            {state.context.wordCount} words • {state.context.charCount} characters
            <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#999' }}>
              State: {state.value.toString()}
            </span>
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
            <button 
              onClick={handleRetry} 
              style={{ 
                marginLeft: '10px', 
                padding: '4px 8px', 
                background: '#667eea', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Retry
            </button>
            <button 
              onClick={handleClearError} 
              style={{ 
                marginLeft: '5px', 
                padding: '4px 8px', 
                background: '#6b7280', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Clear
            </button>
          </div>
        )}

        {state.matches('success') && state.context.aiResponse && (
          <div className="status-message" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#10b981'
          }}>
            ✨ Added: "{state.context.aiResponse}"
          </div>
        )}
      </div>
    </div>
  );
};

export default App;