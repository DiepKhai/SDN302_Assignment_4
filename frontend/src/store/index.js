import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import quizReducer from './quizSlice';
import questionReducer from './questionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    quizzes: quizReducer,
    questions: questionReducer,
  },
});
