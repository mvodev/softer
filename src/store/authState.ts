import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './store';
import axios from 'axios';
import { Base64 } from 'js-base64';

export type AuthState = {
  token: string,
  refreshToken: string,
  status: null | 'loading' | 'resolved' | 'rejected',
  error: null | string,
  isAuthenticated: boolean,
  code: number | null,
  expiresIn:number|null,
}

const initialState: AuthState = {
  token: '',
  refreshToken: '',
  status: null,
  error: null,
  isAuthenticated: false,
  code: null,
  expiresIn:null,
};

export const sendAuth = createAsyncThunk(
  'auth/sendAuth',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (payload: {code:number}, { rejectWithValue }) => {
    const { code } = payload;
    try {
      const response = await axios.post(`https://oauth.yandex.ru/token`,{
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': '2284545861a84c8fa68d1969a25186a6',
        'client_secret': '3b8401ffb70a419ea46922d1fa438b83',
      },{
        headers:{
          "Content-Type":'application/x-www-form-urlencoded',
          "Authorization":`Basic ${Base64.encode('2284545861a84c8fa68d1969a25186a6:3b8401ffb70a419ea46922d1fa438b83')}`
        }
      })
      if (response?.status === 200) {
        const token: string = response.data.access_token;
        const refreshToken: string = response.data.refresh_token;
        const expiresIn: number = response.data.expires_in;
        return { expiresIn, token, status: 200, refreshToken };
      }
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message ? error.response?.data?.message : error.message);
      }
    }
  }
)

export const authReducer = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logOut: (state) => {
      state.isAuthenticated = false;
      state.token = '';
      state.status = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
      state.status = null;
    },
    setCode: (state,action) => {
      state.code = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(sendAuth.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    }),
      builder.addCase(sendAuth.fulfilled, (state, action) => {
        state.status = 'resolved';
        if (action.payload !== null) {
          if (action.payload?.status === 200) {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.expiresIn = action.payload.expiresIn;
            state.isAuthenticated = true;
            state.error = null;
          }
        }
      }),
      builder.addCase(sendAuth.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.payload as string;
      })
  },
});

export const { logOut, clearError, setCode } = authReducer.actions;

export const selectAuth = (state: RootState) => state.auth;

export default authReducer.reducer;
