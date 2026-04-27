import Message from '../models/message';
import Conversation from '../models/conversation';

class SearchService {
  async searchMessages(query: string, userId: string, conversationId?: string) {
    // 构建搜索条件
    const searchConditions: any = {
      $text: { $search: query }
    };

    // 如果指定了对话ID，只搜索该对话中的消息
    if (conversationId) {
      // 验证对话属于用户
      const conversation = await Conversation.findOne({ _id: conversationId, userId });
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      searchConditions.conversationId = conversationId;
    } else {
      // 搜索用户的所有对话中的消息
      const conversations = await Conversation.find({ userId });
      const conversationIds = conversations.map(convo => convo._id);
      searchConditions.conversationId = { $in: conversationIds };
    }

    // 执行搜索
    const messages = await Message.find(searchConditions).sort({ timestamp: -1 });

    return messages;
  }

  async searchConversations(query: string, userId: string) {
    // 搜索对话标题和描述
    const conversations = await Conversation.find({
      userId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).sort({ lastAccessedAt: -1 });

    return conversations;
  }
}

export default new SearchService();