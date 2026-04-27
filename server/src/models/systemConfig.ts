import mongoose from 'mongoose';

interface AIModel {
  name: string;
  apiKey: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
}

interface SystemSettings {
  maxConversationSize: number;
  maxMessageLength: number;
  rateLimit: number;
}

interface SystemConfigDocument extends mongoose.Document {
  aiModels: AIModel[];
  systemSettings: SystemSettings;
  updatedAt: Date;
}

const systemConfigSchema = new mongoose.Schema({
  aiModels: {
    type: [{
      name: {
        type: String,
        required: true
      },
      apiKey: {
        type: String,
        required: true
      },
      baseUrl: {
        type: String,
        required: true
      },
      maxTokens: {
        type: Number,
        default: 4096
      },
      temperature: {
        type: Number,
        default: 0.7
      }
    }],
    default: []
  },
  systemSettings: {
    type: {
      maxConversationSize: {
        type: Number,
        default: 1000
      },
      maxMessageLength: {
        type: Number,
        default: 10000
      },
      rateLimit: {
        type: Number,
        default: 100
      }
    },
    default: {}
  }
}, {
  timestamps: true
});

const SystemConfig = mongoose.model<SystemConfigDocument>('SystemConfig', systemConfigSchema);

export default SystemConfig;