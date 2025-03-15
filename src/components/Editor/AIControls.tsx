// src/components/Editor/AIControls.tsx
import { Editor } from '@tiptap/react';
import { useState } from 'react';

type AIControlsProps = {
  editor: Editor | null;
  onComplete: (prompt: string) => void;
  onImprove: () => void;
  isGenerating: boolean;
};

export default function AIControls({ 
  editor, 
  onComplete, 
  onImprove, 
  isGenerating 
}: AIControlsProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onComplete(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="ai-controls">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt for AI generation..."
          className="flex-1 px-4 py-2 border rounded"
          disabled={isGenerating}
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={isGenerating || !prompt.trim()}
        >
          Generate
        </button>
      </form>
      
      <button 
        onClick={onImprove} 
        className="px-4 py-2 mt-2 bg-gray-100 text-gray-800 rounded"
        disabled={isGenerating || !editor?.isActive('textSelection')}
      >
        Improve Selection
      </button>
      
      {isGenerating && (
        <div className="mt-2 text-blue-600">
          AI is generating content...
        </div>
      )}
    </div>
  );
}