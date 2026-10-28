import '../../i18n/i18n';

// Per-weight subpath imports: the package index re-exports all 18 faces and would bundle every .ttf.
import { Geist_400Regular } from '@expo-google-fonts/geist/400Regular';
import { Geist_500Medium } from '@expo-google-fonts/geist/500Medium';
import { Geist_600SemiBold } from '@expo-google-fonts/geist/600SemiBold';
import { Geist_700Bold } from '@expo-google-fonts/geist/700Bold';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono/400Regular';
import { GeistMono_500Medium } from '@expo-google-fonts/geist-mono/500Medium';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import Toast from 'react-native-toast-message';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import SuperTokens from 'supertokens-react-native';
import { persistor, store } from '../../store/store';
import { AuthGate } from '../components/auth-gate';
import { toastConfig } from '../components/AppToast';
import { loadThemePreference } from '../lib/theme-preference';
import { useAppColorScheme } from '../theme/scheme';


SplashScreen.preventAutoHideAsync();

SuperTokens.init({
  apiDomain: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000",
  apiBasePath: "/auth",
});

// Safety net: gives any third-party <Text>/<TextInput> (toasts, pickers) Geist as
// the default face. Our own screens use the ds <Text> primitive, which picks the
// per-weight Geist family explicitly (native has no variable-weight support).
function applyDefaultFont() {
  // biome-ignore lint/suspicious/noExplicitAny: patching RN's defaultProps, which isn't in its public types
  const AnyText = Text as any;
  AnyText.defaultProps = AnyText.defaultProps || {};
  AnyText.defaultProps.style = [{ fontFamily: 'Geist_400Regular' }, AnyText.defaultProps.style];

  // biome-ignore lint/suspicious/noExplicitAny: patching RN's defaultProps, which isn't in its public types
  const AnyTextInput = TextInput as any;
  AnyTextInput.defaultProps = AnyTextInput.defaultProps || {};
  AnyTextInput.defaultProps.style = [{ fontFamily: 'Geist_400Regular' }, AnyTextInput.defaultProps.style];
}

export default function TabLayout() {
  const colorScheme = useAppColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    GeistMono_400Regular,
    GeistMono_500Medium,
  });

  // Re-apply the user's saved light/dark choice (overrides the system scheme).
  useEffect(() => {
    void loadThemePreference();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      applyDefaultFont();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

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
          <Toast config={toastConfig} topOffset={58} />
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
