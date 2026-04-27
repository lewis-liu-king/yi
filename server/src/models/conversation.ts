import mongoose from 'mongoose';

interface ConversationDocument extends mongoose.Document {
  rootNodeId: string;
  userId: string;
  title: string;
  description?: string;
  nodeCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
}

const conversationSchema = new mongoose.Schema({
  rootNodeId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  nodeCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
conversationSchema.index({ userId: 1 });
conversationSchema.index({ lastAccessedAt: 1 });

const Conversation = mongoose.model<ConversationDocument>('Conversation', conversationSchema);

export default Conversation;