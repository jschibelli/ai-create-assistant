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

    const content = response.content[0];
    return content?.type === 'text' ? content.text : '';
  }

  async streamContent(prompt: string, onToken: (token: string) => void, options: any = {}): Promise<void> {
    const stream = await this.client.messages.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      ...options
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.text) {
        onToken(chunk.delta.text);
      }
    }
  }

  getModelInfo() {
    // Model-specific information
    const modelData: Record<string, { contextWindow: number, costPer1KTokens: number }> = {
      'claude-3-opus-20240229': { contextWindow: 200000, costPer1KTokens: 0.015 },
      'claude-3-sonnet-20240229': { contextWindow: 180000, costPer1KTokens: 0.003 },
      'claude-3-haiku-20240307': { contextWindow: 180000, costPer1KTokens: 0.00025 }
    };

    return {
      name: this.model,
      ...modelData[this.model]
    };
  }
}