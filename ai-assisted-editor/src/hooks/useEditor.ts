import { useMachine } from '@xstate/react';
import editorMachine from '../machines/editorMachine';
import aiService from '../services/aiService';

const useEditor = () => {
  const [state, send] = useMachine(editorMachine);

  const continueWriting = async (currentText: string) => {
    send({ type: 'CONTINUE_WRITING' });
    try {
      const aiResponse = await aiService.generateContinuation(currentText);
      send({ type: 'SET_AI_RESPONSE', text: aiResponse });
    } catch (error) {
      send({ type: 'SET_ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return {
    editorState: state,
    continueWriting
  };
};

export default useEditor;