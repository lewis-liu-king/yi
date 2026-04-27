import { Configuration, OpenAIApi } from 'openai';
import contextService from './context.service';

interface ChatInput {
  message: string;
  context: any[];
  model?: string;
  temperature?: number;
}

class AIService {
  private openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(input: ChatInput) {
    const { message, context, model = 'gpt-3.5-turbo', temperature = 0.7 } = input;

    // 优化上下文
    const { optimizedContext } = contextService.optimizeContext(context);

    // 构建AI对话内容
    const contextContent = contextService.buildAIContent(optimizedContext);

    // 构建提示
    const prompt = `You are an AI assistant. Here's the conversation history:

${contextContent}

User: ${message}

Assistant:`;

    try {
      const response = await this.openai.createCompletion({
        model,
        prompt,
        temperature,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      return {
        response: response.data.choices[0].text?.trim() || '',
        context: optimizedContext
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  async optimizeContext(messages: any[], maxTokens: number = 1000) {
    return contextService.optimizeContext(messages, maxTokens);
  }

  async getAvailableModels() {
    try {
      const response = await this.openai.listModels();
      return response.data.data.map(model => model.id);
    } catch (error) {
      console.error('Failed to get models:', error);
      // 返回默认模型
      return ['gpt-3.5-turbo', 'gpt-4'];
    }
  }
}

export default new AIService();