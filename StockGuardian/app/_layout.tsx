import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import FloatingSearch from './fab';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="sk_demo" />
        <Stack.Screen name="mystockDetails" />
      </Stack>
      
      <FloatingSearch />

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
