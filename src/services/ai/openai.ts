import { OpenAI } from 'openai';
import { AIService } from './base';

export class OpenAIService extends AIService {
  private client: OpenAI;
  private model: string;

  constructor(model: string = 'gpt-4o') {
    super();
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = model;
  }

  async generateContent(prompt: string, options: any = {}): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      ...options
    });

    return response.choices[0]?.message?.content || '';
  }

  getModelInfo() {
    // Model-specific information
    const modelData: Record<string, { contextWindow: number, costPer1KTokens: number }> = {
      'gpt-4o': { contextWindow: 128000, costPer1KTokens: 0.01 },
      'gpt-4': { contextWindow: 8192, costPer1KTokens: 0.03 }
      // Add other models as needed
    };

    return {
      name: this.model,
      ...modelData[this.model]
    };
  }
}