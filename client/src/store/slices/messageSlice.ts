import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import messageService from '../../services/message';

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

interface MessageState {
  messages: Record<string, Message>;
  loading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  messages: {},
  loading: false,
  error: null
};

// Async thunks
export const createMessage = createAsyncThunk(
  'message/createMessage',
  async (messageData: { content: string; parentId: string; conversationId: string; sender: 'user' | 'ai'; metadata?: any }, { rejectWithValue }) => {
    try {
      const message = await messageService.createMessage(messageData);
      return message;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMessageById = createAsyncThunk(
  'message/getMessageById',
  async (id: string, { rejectWithValue }) => {
    try {
      const message = await messageService.getMessageById(id);
      return message;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMessage = createAsyncThunk(
  'message/updateMessage',
  async (data: { id: string; content?: string; metadata?: any }, { rejectWithValue }) => {
    try {
      const message = await messageService.updateMessage(data.id, data);
      return message;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'message/deleteMessage',
  async (id: string, { rejectWithValue }) => {
    try {
      await messageService.deleteMessage(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getChildMessages = createAsyncThunk(
  'message/getChildMessages',
  async (parentId: string, { rejectWithValue }) => {
    try {
      const messages = await messageService.getChildMessages(parentId);
      return { parentId, messages };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMessageContext = createAsyncThunk(
  'message/getMessageContext',
  async (data: { messageId: string; depth?: number }, { rejectWithValue }) => {
    try {
      const context = await messageService.getMessageContext(data.messageId, data.depth);
      return context;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const batchGetMessages = createAsyncThunk(
  'message/batchGetMessages',
  async (messageIds: string[], { rejectWithValue }) => {
    try {
      const messages = await messageService.batchGetMessages(messageIds);
      return messages;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Create message
    builder
      .addCase(createMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages[action.payload._id] = action.payload;
        // Update parent message's childrenIds
        if (action.payload.parentId && state.messages[action.payload.parentId]) {
          state.messages[action.payload.parentId].childrenIds.push(action.payload._id);
        }
      })
      .addCase(createMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get message by id
    builder
      .addCase(getMessageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMessageById.fulfilled, (state, action) => {
        state.loading = false;
        state.messages[action.payload._id] = action.payload;
      })
      .addCase(getMessageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update message
    builder
      .addCase(updateMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages[action.payload._id] = action.payload;
      })
      .addCase(updateMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete message
    builder
      .addCase(deleteMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the message
        delete state.messages[action.payload];
        // Remove from parent's childrenIds
        Object.values(state.messages).forEach(message => {
          message.childrenIds = message.childrenIds.filter(id => id !== action.payload);
        });
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get child messages
    builder
      .addCase(getChildMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChildMessages.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.messages.forEach(message => {
          state.messages[message._id] = message;
        });
      })
      .addCase(getChildMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get message context
    builder
      .addCase(getMessageContext.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMessageContext.fulfilled, (state, action) => {
        state.loading = false;
        // Add context messages to store
        action.payload.context.forEach(message => {
          state.messages[message._id] = message;
        });
        // Add target message to store
        state.messages[action.payload.targetMessage._id] = action.payload.targetMessage;
      })
      .addCase(getMessageContext.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Batch get messages
    builder
      .addCase(batchGetMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchGetMessages.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach(message => {
          state.messages[message._id] = message;
        });
      })
      .addCase(batchGetMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = messageSlice.actions;

export default messageSlice.reducer;