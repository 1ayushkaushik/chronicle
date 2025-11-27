import React, { useEffect, useRef, useState } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { keymap } from 'prosemirror-keymap';
import { history, undo, redo } from 'prosemirror-history';
import { baseKeymap } from 'prosemirror-commands';
import { TextSelection } from 'prosemirror-state';

interface EditorProps {
  value?: string;
  onChange?: (text: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value = '', onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use basic schema
  const mySchema = schema;

  useEffect(() => {
    if (!editorRef.current || isInitialized) return;

    // Create initial document from text content
    const createDocFromText = (text: string) => {
      if (!text.trim()) {
        return mySchema.node('doc', null, [
          mySchema.node('paragraph', null, [])
        ]);
      }

      // Split text into paragraphs and create nodes
      const paragraphs = text.split('\n\n').filter(p => p.trim());
      const paragraphNodes = paragraphs.map(para => {
        const textNode = para.trim() ? mySchema.text(para.trim()) : null;
        return mySchema.node('paragraph', null, textNode ? [textNode] : []);
      });

      return mySchema.node('doc', null, paragraphNodes.length ? paragraphNodes : [
        mySchema.node('paragraph', null, [])
      ]);
    };

    // Create editor state with basic plugins
    const state = EditorState.create({
      doc: createDocFromText(value),
      plugins: [
        history(),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo,
          ...baseKeymap
        })
      ]
    });

    // Create editor view with custom dispatch
    const view = new EditorView(editorRef.current, {
      state,
      dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        
        // Extract plain text and notify parent when content changes
        if (onChange && transaction.docChanged) {
          const textContent = newState.doc.textContent;
          onChange(textContent);
        }
      },
      attributes: {
        class: 'prosemirror-editor',
        'data-placeholder': 'Start writing your masterpiece... ✨'
      },
      handleDOMEvents: {
        focus: () => {
          // Add focus styles
          if (editorRef.current) {
            editorRef.current.closest('.editor-wrapper')?.classList.add('editor-focused');
          }
          return false;
        },
        blur: () => {
          // Remove focus styles
          if (editorRef.current) {
            editorRef.current.closest('.editor-wrapper')?.classList.remove('editor-focused');
          }
          return false;
        }
      }
    });

    viewRef.current = view;
    setIsInitialized(true);

    // Focus the editor initially
    setTimeout(() => {
      view.focus();
    }, 100);

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
      setIsInitialized(false);
    };
  }, []);

  // Update content when value prop changes (for AI continuations)
  useEffect(() => {
    if (!viewRef.current || !isInitialized) return;
    
    const currentText = viewRef.current.state.doc.textContent;
    if (currentText !== value && value !== undefined) {
      const createUpdatedDoc = (text: string) => {
        if (!text.trim()) {
          return mySchema.node('doc', null, [
            mySchema.node('paragraph', null, [])
          ]);
        }

        // Split text into paragraphs
        const paragraphs = text.split('\n\n').filter(p => p.trim());
        const paragraphNodes = paragraphs.map(para => {
          const textNode = para.trim() ? mySchema.text(para.trim()) : null;
          return mySchema.node('paragraph', null, textNode ? [textNode] : []);
        });

        return mySchema.node('doc', null, paragraphNodes.length ? paragraphNodes : [
          mySchema.node('paragraph', null, [])
        ]);
      };

      const newState = EditorState.create({
        doc: createUpdatedDoc(value),
        plugins: viewRef.current.state.plugins
      });

      viewRef.current.updateState(newState);
      
      // Keep cursor at the end after AI continuation
      setTimeout(() => {
        if (viewRef.current) {
          const { state } = viewRef.current;
          const endPos = state.doc.content.size;
          // Set cursor to end of document using TextSelection
          const tr = state.tr.setSelection(
            TextSelection.create(state.doc, endPos)
          );
          viewRef.current.dispatch(tr);
          viewRef.current.focus();
        }
      }, 50);
    }
  }, [value, isInitialized]);

  return (
    <div className="editor-wrapper">
      <div className="editor-container">
        {!isInitialized && (
          <div className="editor-loading">
            <div className="loading-spinner"></div>
            <span>Initializing ProseMirror editor...</span>
          </div>
        )}
        <div 
          ref={editorRef} 
          className="prosemirror-container"
          style={{ display: isInitialized ? 'block' : 'none' }}
        />
      </div>
    </div>
  );
};

export default Editor;