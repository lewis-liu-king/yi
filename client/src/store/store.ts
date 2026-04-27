import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import conversationReducer from './slices/conversationSlice';
import messageReducer from './slices/messageSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    conversation: conversationReducer,
    message: messageReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;