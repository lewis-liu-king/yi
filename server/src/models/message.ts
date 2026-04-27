import mongoose from 'mongoose';

interface MessageMetadata {
  isMarked?: boolean;
  branchName?: string;
  formattedContent?: string;
  tokenCount?: number;
}

interface MessageDocument extends mongoose.Document {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  parentId: string | null;
  childrenIds: string[];
  conversationId: string;
  metadata: MessageMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  parentId: {
    type: String,
    default: null
  },
  childrenIds: {
    type: [String],
    default: []
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  metadata: {
    type: {
      isMarked: {
        type: Boolean,
        default: false
      },
      branchName: {
        type: String
      },
      formattedContent: {
        type: String
      },
      tokenCount: {
        type: Number
      }
    },
    default: {}
  }
}, {
  timestamps: true
});

// Create indexes
messageSchema.index({ conversationId: 1 });
messageSchema.index({ parentId: 1 });
messageSchema.index({ timestamp: 1 });
messageSchema.index({ content: 'text' });

const Message = mongoose.model<MessageDocument>('Message', messageSchema);

export default Message;