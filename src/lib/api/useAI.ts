import { useState, useCallback } from 'react';
import useSWRMutation from 'swr/mutation';

type AIRequestOptions = {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
};

type UseAIProps = {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

async function generateContent(
  url: string, 
  { arg }: { arg: { model: string; content: string; options?: AIRequestOptions } }
) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to generate content');
  }
  
  return res.json();
}

export function useAI({ onSuccess, onError }: UseAIProps = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { trigger, isMutating, error, data } = useSWRMutation(
    '/api/ai',
    generateContent,
    {
      onSuccess,
      onError,
    }
  );
  
  const generate = useCallback(
    async (model: string, content: string, options?: AIRequestOptions) => {
      setIsGenerating(true);
      try {
        const result = await trigger({ model, content, options });
        setIsGenerating(false);
        return result;
      } catch (err) {
        setIsGenerating(false);
        throw err;
      }
    },
    [trigger]
  );
  
  return {
    generate,
    isGenerating: isGenerating || isMutating,
    error,
    data,
  };
}