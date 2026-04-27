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

interface CreateMessageData {
  content: string;
  parentId: string;
  conversationId: string;
  sender: 'user' | 'ai';
  metadata?: any;
}

interface UpdateMessageData {
  content?: string;
  metadata?: any;
}

interface MessageContext {
  context: Message[];
  targetMessage: Message;
}

const messageService = {
  async createMessage(data: CreateMessageData): Promise<Message> {
    return api.post('/messages', data);
  },

  async getMessageById(id: string): Promise<Message> {
    return api.get(`/messages/${id}`);
  },

  async updateMessage(id: string, data: UpdateMessageData): Promise<Message> {
    return api.put(`/messages/${id}`, data);
  },

  async deleteMessage(id: string): Promise<{ success: boolean }> {
    return api.delete(`/messages/${id}`);
  },

  async getChildMessages(parentId: string): Promise<Message[]> {
    return api.get(`/messages/${parentId}/children`);
  },

  async getMessageContext(messageId: string, depth?: number): Promise<MessageContext> {
    const params = depth ? { depth } : {};
    return api.get(`/messages/${messageId}/context`, { params });
  },

  async batchGetMessages(messageIds: string[]): Promise<Message[]> {
    return api.post('/messages/batch', { messageIds });
  }
};

export default messageService;