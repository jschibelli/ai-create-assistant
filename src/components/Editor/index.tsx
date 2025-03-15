// src/components/Editor/index.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import AIControls from './AIControls';
import MenuBar from './MenuBar';
import { useEditorAI } from '@/hooks/useEditorAI';
import { AIModelSelector } from '@/components/AIModelSelector';
import { useState } from 'react';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { AIStreamingProvider } from './ai-bridge/AIStreamingProvider';

export default function ContentEditor() {
  const { data: session } = useSession();
  const router = useRouter();
  const { documentId } = router.query; // Get from URL params
  
  // If no documentId in URL, could use a default or redirect
  const documentIdToUse = Array.isArray(documentId) ? documentId[0] : (documentId || 'default');
  
  // Fetch document data
  const [currentDocument, setCurrentDocument] = useState({ id: documentIdToUse, title: 'Untitled' });
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  
  // Initialize Y.js document
  const ydoc = new Y.Doc();
  const provider = new HocuspocusProvider({
    url: process.env.NEXT_PUBLIC_COLLABORATION_URL || 'ws://localhost:1234',
    name: documentIdToUse, // Get this from route params or props
    document: ydoc
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing or use AI to generate content...'
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: session?.user?.name || 'Anonymous',
          color: '#ff0000', // Generate random color
        },
      }),
    ],
    content: '',
    autofocus: true
  });
  
  const { completeText, improveSelection, isGenerating } = useEditorAI(editor, {
    selectedModel: selectedModel,
    documentId: currentDocument.id
  });

  return (
    <div className="editor-container">
      <AIStreamingProvider editor={editor}>
        <AIModelSelector 
          selectedModel={selectedModel} 
          onChange={setSelectedModel} 
          disabled={isGenerating}
        />
        
        <MenuBar editor={editor} />
        
        <AIControls 
          editor={editor} 
          onComplete={completeText} 
          onImprove={improveSelection}
          isGenerating={isGenerating}
        />
        
        <EditorContent editor={editor} className="editor-content" />
      </AIStreamingProvider>
    </div>
  );
}