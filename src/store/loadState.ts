import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './store';
import axios from 'axios';

export type LoadState = {
  status: null | 'loading' | 'resolved' | 'rejected',
  error: null | string,
}

const initialState: LoadState = {
  status: null,
  error: null,
};

export const sendFile = createAsyncThunk(
  'file/sendFile',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (payload: {files:FormData}, { rejectWithValue }) => {
    const { files } = payload;
    try {
      console.log('inside try files');
      console.log(files);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message ? error.response?.data?.message : error.message);
      }
    }
  }
)

export const fileReducer = createSlice({
  name: 'file',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(sendFile.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    }),
      builder.addCase(sendFile.fulfilled, (state) => {
        state.status = 'resolved';
        
      }),
      builder.addCase(sendFile.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.payload as string;
      })
  },
});


export const selectFile = (state: RootState) => state.file;

export default fileReducer.reducer;
