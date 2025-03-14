import { Anthropic } from '@anthropic-ai/sdk';
import { AIService } from './base';

export class AnthropicService extends AIService {
  private client: Anthropic;
  private model: string;

  constructor(model: string = 'claude-3-opus-20240229') {
    super();
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.model = model;
  }

  async generateContent(prompt: string, options: any = {}): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      ...options
    });

    return response.content[0]?.text || '';
  }

  getModelInfo() {
    // Model-specific information
    const modelData: Record<string, { contextWindow: number, costPer1KTokens: number }> = {
      'claude-3-opus-20240229': { contextWindow: 200000, costPer1KTokens: 0.015 },
      'claude-3-sonnet-20240229': { contextWindow: 180000, costPer1KTokens: 0.003 }
      // Add other models as needed
    };

    return {
      name: this.model,
      ...modelData[this.model]
    };
  }
}