import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { I18nProvider } from '@/lib/i18n';
import { SessionProvider } from '@/lib/session';
import { initNotifications, sendImmediateNotification, scheduleRepeatingNotification } from '@/lib/notifications';
import { View, Text, StyleSheet } from 'react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [banner, setBanner] = useState<{ title: string; body?: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await initNotifications();

      // welcome system notification
      await sendImmediateNotification('Bienvenue sur Mythenena', 'Heureux de vous revoir — prenez soin de vous');

      // show small in-app banner for a few seconds
      if (mounted) {
        setBanner({ title: 'Bienvenue', body: "Bienvenue sur l'application Mythenena" });
        setTimeout(() => setBanner(null), 4000);
      }

      // schedule reminders (example intervals)
      // respiration reminder: every 6 hours
      scheduleRepeatingNotification('reminder-breath', 'Séance de respiration', "N'oubliez pas votre séance de respiration", 60 * 60 * 6);
      // motivation reminder: every 12 hours
      scheduleRepeatingNotification('reminder-motivation', 'Petit rappel', 'Tu es capable — courage !', 60 * 60 * 12);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <I18nProvider>
      <SessionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          {banner && (
            <View style={styles.banner} pointerEvents="none">
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              {banner.body ? <Text style={styles.bannerBody}>{banner.body}</Text> : null}
            </View>
          )}
          <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="premium" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </View>
      </ThemeProvider>
      </SessionProvider>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 30,
    left: 12,
    right: 12,
    zIndex: 1000,
    backgroundColor: '#ffffffee',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
  },
  bannerTitle: {
    fontWeight: '700',
    color: '#276653',
  },
  bannerBody: {
    fontSize: 12,
    color: '#333',
  },
});
