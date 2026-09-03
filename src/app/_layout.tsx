import '../../i18n/i18n';

import { Archivo_400Regular, Archivo_500Medium, Archivo_600SemiBold, Archivo_700Bold, Archivo_800ExtraBold } from '@expo-google-fonts/archivo';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, TextInput, useColorScheme } from 'react-native';
import Toast from 'react-native-toast-message';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import SuperTokens from 'supertokens-react-native';
import { persistor, store } from '../../store/store';
import { AuthGate } from '../components/auth-gate';
import { toastConfig } from '../components/AppToast';


SplashScreen.preventAutoHideAsync();

SuperTokens.init({
  apiDomain: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000",
  apiBasePath: "/auth",
});

// Applies Archivo as the app-wide default body font without touching every
// screen's StyleSheet — screens that already set fontWeight (700/800 etc.)
// keep rendering bold via the platform's synthetic-bold fallback, since
// Archivo's own weight-specific files aren't wired up per fontWeight value.
// Instrument Serif is applied explicitly per-screen instead (headers,
// wordmark) since it's meant for "big moments" only, not body text.
function applyDefaultFont() {
  // biome-ignore lint/suspicious/noExplicitAny: patching RN's defaultProps, which isn't in its public types
  const AnyText = Text as any;
  AnyText.defaultProps = AnyText.defaultProps || {};
  AnyText.defaultProps.style = [{ fontFamily: 'Archivo_400Regular' }, AnyText.defaultProps.style];

  // biome-ignore lint/suspicious/noExplicitAny: patching RN's defaultProps, which isn't in its public types
  const AnyTextInput = TextInput as any;
  AnyTextInput.defaultProps = AnyTextInput.defaultProps || {};
  AnyTextInput.defaultProps.style = [{ fontFamily: 'Archivo_400Regular' }, AnyTextInput.defaultProps.style];
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

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
          <Toast config={toastConfig} />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
