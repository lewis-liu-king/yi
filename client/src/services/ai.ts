import api from './api';

interface Message {
  _id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  parentId: string | null;
  childrenIds: string[];
  conversationId: string;
  metadata: {
    isMarked?: boolean;
    branchName?: string;
    formattedContent?: string;
    tokenCount?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ChatData {
  message: string;
  context: Message[];
  model?: string;
  temperature?: number;
}

interface ChatResponse {
  response: string;
  context: Message[];
}

interface OptimizeContextData {
  messages: Message[];
  maxTokens?: number;
}

interface OptimizeContextResponse {
  optimizedContext: Message[];
  tokenCount: number;
}

const aiService = {
  async chat(data: ChatData): Promise<ChatResponse> {
    return api.post('/ai/chat', data);
  },

  async optimizeContext(data: OptimizeContextData): Promise<OptimizeContextResponse> {
    return api.post('/ai/context', data);
  },

  async getAvailableModels(): Promise<string[]> {
    return api.get('/ai/models');
  }
};

export default aiService;