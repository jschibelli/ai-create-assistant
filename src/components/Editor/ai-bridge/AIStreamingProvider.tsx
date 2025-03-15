// src/components/Editor/ai-bridge/AIStreamingProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Editor } from '@tiptap/core';

type AIStreamingContextType = {
  requestCompletion: (prompt: string, position: number) => void;
  isStreaming: boolean;
  cancelStreaming: () => void;
};

const AIStreamingContext = createContext<AIStreamingContextType | null>(null);

export const AIStreamingProvider = ({ children, editor }: { children: React.ReactNode, editor: Editor }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  
  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io('/ai-completions', {
      path: '/api/socketio',
      withCredentials: true,
    });
    
    setSocket(socketInstance);
    
    // Socket lifecycle management
    socketInstance.on('connect', () => {
      console.log('Connected to AI streaming service');
    });
    
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  
  // Stream handling logic
  useEffect(() => {
    if (!socket || !editor) return;
    
    // Handle incoming token streams
    socket.on('token', (token: string) => {
      editor.commands.insertContent(token);
    });
    
    socket.on('completion_end', () => {
      setIsStreaming(false);
    });
    
    return () => {
      socket.off('token');
      socket.off('completion_end');
    };
  }, [socket, editor]);
  
  const requestCompletion = (prompt: string, position: number) => {
    if (!socket) return;
    
    setIsStreaming(true);
    socket.emit('request_completion', { prompt, position, modelId: 'claude-3-opus-20240229' });
  };
  
  const cancelStreaming = () => {
    if (!socket) return;
    
    socket.emit('cancel_completion');
    setIsStreaming(false);
  };
  
  return (
    <AIStreamingContext.Provider value={{ requestCompletion, isStreaming, cancelStreaming }}>
      {children}
    </AIStreamingContext.Provider>
  );
};

export const useAIStreaming = () => {
  const context = useContext(AIStreamingContext);
  if (!context) {
    throw new Error('useAIStreaming must be used within an AIStreamingProvider');
  }
  return context;
};