import React, { useEffect, useRef, useState } from 'react';

interface EditorProps {
  value?: string;
  onChange?: (text: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value = '', onChange }) => {
  const [text, setText] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (onChange) {
      onChange(newText);
    }
  };

  return (
    <div className="editor-wrapper">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        className="editor-textarea"
        placeholder="Start writing your masterpiece... ✨"
        spellCheck="true"
      />
    </div>
  );
};

export default Editor;