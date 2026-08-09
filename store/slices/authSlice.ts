import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface AuthState {
  supertokensUserId: string | null;
  email: string | null;
}

const initialState: AuthState = {
  supertokensUserId: null,
  email: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ supertokensUserId: string; email: string }>) => {
      state.supertokensUserId = action.payload.supertokensUserId;
      state.email = action.payload.email;
    },
    clearAuth: (state) => {
      state.supertokensUserId = null;
      state.email = null;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.supertokensUserId !== null;