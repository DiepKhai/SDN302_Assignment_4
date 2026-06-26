import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/quizzes';

export const fetchQuizzes = createAsyncThunk('quizzes/fetchQuizzes', async (_, { getState }) => {
  const { auth } = getState();
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return response.data;
});

export const fetchQuizById = createAsyncThunk('quizzes/fetchQuizById', async (id, { getState }) => {
  const { auth } = getState();
  const response = await axios.get(`${API_URL}/${id}/populate`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return response.data;
});

export const createQuiz = createAsyncThunk('quizzes/createQuiz', async (quizData, { getState }) => {
  const { auth } = getState();
  const response = await axios.post(API_URL, quizData, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return response.data;
});

export const deleteQuiz = createAsyncThunk('quizzes/deleteQuiz', async (id, { getState }) => {
  const { auth } = getState();
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return id;
});

export const addQuestionToQuiz = createAsyncThunk('quizzes/addQuestionToQuiz', async ({ quizId, questionData }, { getState }) => {
  const { auth } = getState();
  const response = await axios.post(`${API_URL}/${quizId}/question`, questionData, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return response.data;
});

const quizSlice = createSlice({
  name: 'quizzes',
  initialState: {
    list: [],
    currentQuiz: null,
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.currentQuiz = action.payload;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.list = state.list.filter(q => q._id !== action.payload);
      })
      .addCase(addQuestionToQuiz.fulfilled, (state, action) => {
        state.currentQuiz = action.payload; // backend returns updated quiz populated
      });
  }
});

export default quizSlice.reducer;
