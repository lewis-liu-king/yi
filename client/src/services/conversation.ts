import api from './api';

interface Conversation {
  _id: string;
  rootNodeId: string;
  userId: string;
  title: string;
  description?: string;
  nodeCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
}

interface CreateConversationData {
  title: string;
  description?: string;
}

interface UpdateConversationData {
  title: string;
  description?: string;
}

interface ConversationStats {
  nodeCount: number;
  branchCount: number;
  depth: number;
}

const conversationService = {
  async getConversations(): Promise<Conversation[]> {
    return api.get('/conversations');
  },

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    return api.post('/conversations', data);
  },

  async getConversationById(id: string): Promise<Conversation> {
    return api.get(`/conversations/${id}`);
  },

  async updateConversation(id: string, data: UpdateConversationData): Promise<Conversation> {
    return api.put(`/conversations/${id}`, data);
  },

  async deleteConversation(id: string): Promise<{ success: boolean }> {
    return api.delete(`/conversations/${id}`);
  },

  async getConversationStats(id: string): Promise<ConversationStats> {
    return api.get(`/conversations/${id}/stats`);
  }
};

export default conversationService;