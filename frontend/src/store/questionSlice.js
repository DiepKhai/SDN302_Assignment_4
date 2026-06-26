import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = `${API_BASE}/api/questions`;

export const fetchQuestions = createAsyncThunk('questions/fetchQuestions', async (_, { getState }) => {
  const { auth } = getState();
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return response.data;
});

export const addQuestion = createAsyncThunk('questions/addQuestion', async (questionData, { getState }) => {
  const { auth } = getState();
  const response = await axios.post(API_URL, questionData, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return response.data;
});

export const updateQuestion = createAsyncThunk('questions/updateQuestion', async ({ id, questionData }, { getState }) => {
  const { auth } = getState();
  const response = await axios.put(`${API_URL}/${id}`, questionData, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return response.data;
});

export const deleteQuestion = createAsyncThunk('questions/deleteQuestion', async (id, { getState }) => {
  const { auth } = getState();
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` }
  });
  return id;
});

const questionSlice = createSlice({
  name: 'questions',
  initialState: {
    list: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.list.findIndex(q => q._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.list = state.list.filter(q => q._id !== action.payload);
      });
  }
});

export default questionSlice.reducer;
