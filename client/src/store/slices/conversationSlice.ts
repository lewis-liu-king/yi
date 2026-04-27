import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import conversationService from '../../services/conversation';

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

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  currentBranch: string[];
  loading: boolean;
  error: string | null;
}

const initialState: ConversationState = {
  conversations: [],
  currentConversation: null,
  currentBranch: [],
  loading: false,
  error: null
};

// Async thunks
export const getConversations = createAsyncThunk(
  'conversation/getConversations',
  async (_, { rejectWithValue }) => {
    try {
      const conversations = await conversationService.getConversations();
      return conversations;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createConversation = createAsyncThunk(
  'conversation/createConversation',
  async (conversationData: { title: string; description?: string }, { rejectWithValue }) => {
    try {
      const conversation = await conversationService.createConversation(conversationData);
      return conversation;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getConversationById = createAsyncThunk(
  'conversation/getConversationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const conversation = await conversationService.getConversationById(id);
      return conversation;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateConversation = createAsyncThunk(
  'conversation/updateConversation',
  async (data: { id: string; title: string; description?: string }, { rejectWithValue }) => {
    try {
      const conversation = await conversationService.updateConversation(data.id, data);
      return conversation;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteConversation = createAsyncThunk(
  'conversation/deleteConversation',
  async (id: string, { rejectWithValue }) => {
    try {
      await conversationService.deleteConversation(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    setCurrentBranch: (state, action: PayloadAction<string[]>) => {
      state.currentBranch = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Get conversations
    builder
      .addCase(getConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create conversation
    builder
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations.unshift(action.payload);
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get conversation by id
    builder
      .addCase(getConversationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConversation = action.payload;
        state.currentBranch = [action.payload.rootNodeId];
      })
      .addCase(getConversationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update conversation
    builder
      .addCase(updateConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConversation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.conversations.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.conversations[index] = action.payload;
        }
        if (state.currentConversation && state.currentConversation._id === action.payload._id) {
          state.currentConversation = action.payload;
        }
      })
      .addCase(updateConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete conversation
    builder
      .addCase(deleteConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = state.conversations.filter(c => c._id !== action.payload);
        if (state.currentConversation && state.currentConversation._id === action.payload) {
          state.currentConversation = null;
          state.currentBranch = [];
        }
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setCurrentBranch, clearError } = conversationSlice.actions;

export default conversationSlice.reducer;