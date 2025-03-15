// src/services/ai/base.ts
export abstract class AIService {
  abstract generateContent(prompt: string, options?: any): Promise<string>;
  
  abstract streamContent(
    prompt: string,
    onToken: (token: string) => void,
    options?: any
  ): Promise<void>;
  
  abstract getModelInfo(): { 
    name: string;
    contextWindow: number;
    costPer1KTokens: number;
  };
}