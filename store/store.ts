import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from 'redux-persist';
import { applicationsApi } from './api/applicationApi';
import { authApi } from './api/authApi';
import { companiesApi } from './api/companiesApi';
import { jobsApi } from './api/jobsApi';
import { savedJobsApi } from './api/savedJobsApi';
import { usersApi } from './api/usersApi';
import authReducer from './slices/authSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [jobsApi.reducerPath]: jobsApi.reducer,
  [savedJobsApi.reducerPath]: savedJobsApi.reducer,
  [applicationsApi.reducerPath]: applicationsApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [companiesApi.reducerPath]: companiesApi.reducer,
  // Add your standard UI slices here
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ["auth"], // Specify slice names you want to save permanently. DO NOT persist RTK Query caches.
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      jobsApi.middleware,
      savedJobsApi.middleware,
      applicationsApi.middleware,
      usersApi.middleware,
      companiesApi.middleware),
});

export const persistor = persistStore(store);
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
