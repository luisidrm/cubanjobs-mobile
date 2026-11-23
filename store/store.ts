import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from 'redux-persist';
import { adminApi } from './api/adminApi';
import { adminPaymentsApi } from './api/adminPaymentsApi';
import { applicationsApi } from './api/applicationApi';
import { authApi } from './api/authApi';
import { billingApi } from './api/billingApi';
import { companiesApi } from './api/companiesApi';
import { freelancerApi } from './api/freelancerApi';
import { jobsApi } from './api/jobsApi';
import { notificationsApi } from './api/notificationsApi';
import { plansApi } from './api/plansApi';
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
  [notificationsApi.reducerPath]: notificationsApi.reducer,
  [billingApi.reducerPath]: billingApi.reducer,
  [plansApi.reducerPath]: plansApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [adminPaymentsApi.reducerPath]: adminPaymentsApi.reducer,
  [freelancerApi.reducerPath]: freelancerApi.reducer,
  // Add your standard UI slices here
});

// Expo renders the web pages once in Node (static output), where AsyncStorage's web build
// throws "window is not defined". Persisting only makes sense on a device or in a browser.
const noopStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, value: string) => value,
  removeItem: async (_key: string) => {},
};

const persistConfig = {
  key: 'root',
  storage: typeof window === 'undefined' ? noopStorage : AsyncStorage,
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
      companiesApi.middleware,
      notificationsApi.middleware,
      billingApi.middleware,
      plansApi.middleware,
      adminApi.middleware,
      adminPaymentsApi.middleware,
      freelancerApi.middleware),
});

export const persistor = persistStore(store);
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
