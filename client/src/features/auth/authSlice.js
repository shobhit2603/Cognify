import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  isInitialized: false, // Helps to know if we've checked the auth state initially
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },
    logoutClient: (state) => {
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthenticated, setInitialized, logoutClient } = authSlice.actions;

export default authSlice.reducer;
