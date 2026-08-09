import '../../i18n/i18n';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import SuperTokens from 'supertokens-react-native';
import { persistor, store } from '../../store/store';
import { AuthGate } from '../components/auth-gate';


SplashScreen.preventAutoHideAsync();

SuperTokens.init({
  apiDomain: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000",
  apiBasePath: "/auth",
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="job/[id]" />
            </Stack>
          </AuthGate>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
