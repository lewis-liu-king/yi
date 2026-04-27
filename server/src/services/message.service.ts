import Message from '../models/message';
import Conversation from '../models/conversation';

interface CreateMessageInput {
  content: string;
  parentId: string;
  conversationId: string;
  sender: 'user' | 'ai';
  metadata?: any;
}

class MessageService {
  async createMessage(input: CreateMessageInput) {
    const { content, parentId, conversationId, sender, metadata } = input;

    // Create message
    const message = await Message.create({
      content,
      sender,
      parentId,
      conversationId,
      metadata: metadata || {}
    });

    // Update parent message's childrenIds
    if (parentId) {
      const parentMessage = await Message.findById(parentId);
      if (parentMessage) {
        parentMessage.childrenIds.push(message._id);
        await parentMessage.save();
      }
    }

    // Update conversation node count
    await Conversation.findByIdAndUpdate(conversationId, {
      $inc: { nodeCount: 1 }
    });

    return message;
  }

  async getMessageById(id: string, userId: string) {
    // Find message and verify it belongs to the user
    const message = await Message.findById(id);
    if (!message) {
      throw new Error('Message not found');
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({ _id: message.conversationId, userId });
    if (!conversation) {
      throw new Error('Message not found');
    }

    return message;
  }

  async updateMessage(id: string, userId: string, updates: Partial<CreateMessageInput>) {
    // Find message and verify it belongs to the user
    const message = await Message.findById(id);
    if (!message) {
      throw new Error('Message not found');
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({ _id: message.conversationId, userId });
    if (!conversation) {
      throw new Error('Message not found');
    }

    // Update message
    if (updates.content) {
      message.content = updates.content;
    }
    if (updates.metadata) {
      message.metadata = { ...message.metadata, ...updates.metadata };
    }

    await message.save();
    return message;
  }

  async deleteMessage(id: string, userId: string) {
    // Find message and verify it belongs to the user
    const message = await Message.findById(id);
    if (!message) {
      throw new Error('Message not found');
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({ _id: message.conversationId, userId });
    if (!conversation) {
      throw new Error('Message not found');
    }

    // Recursively delete child messages
    const deleteChildMessages = async (messageId: string) => {
      const childMessage = await Message.findById(messageId);
      if (!childMessage) return;

      // Delete children first
      for (const childId of childMessage.childrenIds) {
        await deleteChildMessages(childId);
      }

      // Delete the message
      await childMessage.deleteOne();
    };

    // Delete child messages
    for (const childId of message.childrenIds) {
      await deleteChildMessages(childId);
    }

    // Update parent message's childrenIds
    if (message.parentId) {
      const parentMessage = await Message.findById(message.parentId);
      if (parentMessage) {
        parentMessage.childrenIds = parentMessage.childrenIds.filter(childId => childId !== id);
        await parentMessage.save();
      }
    }

    // Delete the message
    await message.deleteOne();

    // Update conversation node count
    await Conversation.findByIdAndUpdate(message.conversationId, {
      $inc: { nodeCount: -1 }
    });

    return { success: true };
  }

  async getChildMessages(parentId: string, userId: string) {
    // Find parent message and verify it belongs to the user
    const parentMessage = await Message.findById(parentId);
    if (!parentMessage) {
      throw new Error('Parent message not found');
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({ _id: parentMessage.conversationId, userId });
    if (!conversation) {
      throw new Error('Message not found');
    }

    // Get child messages
    return Message.find({ _id: { $in: parentMessage.childrenIds } }).sort({ timestamp: 1 });
  }

  async getMessageContext(messageId: string, userId: string, depth: number = 3) {
    // Find message and verify it belongs to the user
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({ _id: message.conversationId, userId });
    if (!conversation) {
      throw new Error('Message not found');
    }

    // Get context messages
    const context = [];
    let currentMessage = message;
    
    for (let i = 0; i < depth && currentMessage.parentId; i++) {
      const parentMessage = await Message.findById(currentMessage.parentId);
      if (parentMessage) {
        context.unshift(parentMessage);
        currentMessage = parentMessage;
      } else {
        break;
      }
    }

    return { context, targetMessage: message };
  }

  async batchGetMessages(messageIds: string[], userId: string) {
    if (!messageIds || messageIds.length === 0) {
      return [];
    }

    // Get messages
    const messages = await Message.find({ _id: { $in: messageIds } });

    // Verify all messages belong to the user
    const conversationIds = [...new Set(messages.map(msg => msg.conversationId))];
    const conversations = await Conversation.find({ _id: { $in: conversationIds }, userId });

    if (conversations.length !== conversationIds.length) {
      throw new Error('Some messages not found');
    }

    return messages;
  }
}

export default new MessageService();