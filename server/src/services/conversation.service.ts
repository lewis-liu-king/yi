import Conversation from '../models/conversation';
import Message from '../models/message';

interface CreateConversationInput {
  title: string;
  description?: string;
  userId: string;
}

class ConversationService {
  async createConversation(input: CreateConversationInput) {
    const { title, description, userId } = input;

    // Create a root message node
    const rootMessage = await Message.create({
      content: 'Conversation started',
      sender: 'ai',
      parentId: null,
      conversationId: '', // Will be updated after conversation is created
      metadata: {}
    });

    // Create conversation
    const conversation = await Conversation.create({
      rootNodeId: rootMessage._id,
      userId,
      title,
      description,
      nodeCount: 1
    });

    // Update root message with conversationId
    rootMessage.conversationId = conversation._id;
    await rootMessage.save();

    return conversation;
  }

  async getConversations(userId: string) {
    return Conversation.find({ userId }).sort({ lastAccessedAt: -1 });
  }

  async getConversationById(id: string, userId: string) {
    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Update last accessed time
    conversation.lastAccessedAt = new Date();
    await conversation.save();

    return conversation;
  }

  async updateConversation(id: string, userId: string, updates: Partial<CreateConversationInput>) {
    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (updates.title) {
      conversation.title = updates.title;
    }
    if (updates.description !== undefined) {
      conversation.description = updates.description;
    }

    await conversation.save();
    return conversation;
  }

  async deleteConversation(id: string, userId: string) {
    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId: id });

    // Delete the conversation
    await conversation.deleteOne();

    return { success: true };
  }

  async getConversationStats(id: string, userId: string) {
    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get all messages in the conversation
    const messages = await Message.find({ conversationId: id });

    // Calculate stats
    const nodeCount = messages.length;
    const branchCount = messages.filter(msg => msg.childrenIds.length > 0).length;

    // Calculate depth
    let maxDepth = 0;
    const calculateDepth = async (messageId: string, currentDepth: number) => {
      const message = await Message.findById(messageId);
      if (!message) return;

      if (currentDepth > maxDepth) {
        maxDepth = currentDepth;
      }

      for (const childId of message.childrenIds) {
        await calculateDepth(childId, currentDepth + 1);
      }
    };

    await calculateDepth(conversation.rootNodeId, 1);

    return { nodeCount, branchCount, depth: maxDepth };
  }
}

export default new ConversationService();