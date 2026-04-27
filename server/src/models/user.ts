import mongoose from 'mongoose';

interface UserPreferences {
  theme: 'light' | 'dark';
  defaultAI: string;
  notifications: boolean;
}

interface UserDocument extends mongoose.Document {
  username: string;
  email: string;
  passwordHash: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  preferences: {
    type: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      },
      defaultAI: {
        type: String,
        default: 'gpt-3.5-turbo'
      },
      notifications: {
        type: Boolean,
        default: true
      }
    },
    default: {}
  }
}, {
  timestamps: true
});

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 });

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;