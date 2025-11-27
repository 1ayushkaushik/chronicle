import { createMachine, assign } from 'xstate';

export interface EditorContext {
  text: string;
  aiResponse: string;
  error: string | null;
  wordCount: number;
  charCount: number;
}

export type EditorEvent = 
  | { type: 'UPDATE_TEXT'; text: string }
  | { type: 'CONTINUE_WRITING' }
  | { type: 'SET_AI_RESPONSE'; text: string }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RETRY' }
  | { type: 'CLEAR_ERROR' };

export const editorMachine = createMachine<EditorContext, EditorEvent>({
  id: 'editor',
  initial: 'idle',
  context: {
    text: '',
    aiResponse: '',
    error: null,
    wordCount: 0,
    charCount: 0,
  },
  
  states: {
    idle: {
      on: {
        UPDATE_TEXT: {
          actions: assign({
            text: (_, event) => event.text,
            wordCount: (_, event) => {
              const words = event.text.trim().split(/\s+/).filter((word: string) => word.length > 0);
              return words.length;
            },
            charCount: (_, event) => event.text.length,
            error: null, // Clear any previous errors when editing
          }),
        },
        CONTINUE_WRITING: {
          target: 'loading',
        },
        CLEAR_ERROR: {
          actions: assign({
            error: null,
          }),
        },
      },
    },
    
    loading: {
      entry: assign({
        error: null, // Clear any previous errors
      }),
      on: {
        SET_AI_RESPONSE: {
          target: 'success',
          actions: assign({
            aiResponse: (_, event) => event.text,
            text: (context, event) => context.text + event.text, // Append AI response to current text
            wordCount: (context, event) => {
              const newText = context.text + event.text;
              const words = newText.trim().split(/\s+/).filter((word: string) => word.length > 0);
              return words.length;
            },
            charCount: (context, event) => (context.text + event.text).length,
          }),
        },
        SET_ERROR: {
          target: 'error',
          actions: assign({
            error: (_, event) => event.error,
          }),
        },
        UPDATE_TEXT: {
          // Allow editing while AI is loading (will cancel the AI request)
          target: 'idle',
          actions: assign({
            text: (_, event) => event.text,
            wordCount: (_, event) => {
              const words = event.text.trim().split(/\s+/).filter((word: string) => word.length > 0);
              return words.length;
            },
            charCount: (_, event) => event.text.length,
          }),
        },
      },
    },
    
    success: {
      after: {
        2000: 'idle', // Auto-transition back to idle after 2 seconds
      },
      on: {
        UPDATE_TEXT: {
          target: 'idle',
          actions: assign({
            text: (_, event) => event.text,
            wordCount: (_, event) => {
              const words = event.text.trim().split(/\s+/).filter((word: string) => word.length > 0);
              return words.length;
            },
            charCount: (_, event) => event.text.length,
            aiResponse: '', // Clear AI response when user starts editing
          }),
        },
        CONTINUE_WRITING: {
          target: 'loading',
        },
        CLEAR_ERROR: 'idle',
      },
    },
    
    error: {
      on: {
        RETRY: {
          target: 'loading',
        },
        UPDATE_TEXT: {
          target: 'idle',
          actions: assign({
            text: (_, event) => event.text,
            wordCount: (_, event) => {
              const words = event.text.trim().split(/\s+/).filter((word: string) => word.length > 0);
              return words.length;
            },
            charCount: (_, event) => event.text.length,
            error: null, // Clear error when user starts editing
          }),
        },
        CLEAR_ERROR: {
          target: 'idle',
          actions: assign({
            error: null,
          }),
        },
      },
    },
  },
});

export default editorMachine;