import { createMachine, assign } from 'xstate';

interface EditorContext {
  text: string;
  error: string | null;
}

type EditorEvent = 
  | { type: 'UPDATE_TEXT'; text: string }
  | { type: 'CONTINUE_WRITING' }
  | { type: 'SET_AI_RESPONSE'; text: string }
  | { type: 'SET_ERROR'; error: string };

const editorMachine = createMachine<EditorContext, EditorEvent>({
  id: 'editor',
  initial: 'idle',
  context: {
    text: '',
    error: null,
  },
  states: {
    idle: {
      on: {
        UPDATE_TEXT: {
          actions: assign({
            text: (_, event) => event.text
          })
        },
        CONTINUE_WRITING: 'loading'
      }
    },
    loading: {
      on: {
        SET_AI_RESPONSE: {
          target: 'idle',
          actions: assign({
            text: (context, event) => context.text + event.text,
            error: null
          })
        },
        SET_ERROR: {
          target: 'idle',
          actions: assign({
            error: (_, event) => event.error
          })
        }
      }
    }
  }
});

export default editorMachine;