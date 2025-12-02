import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import FloatingSearch from './fab'; // 🔥 이 경로 맞음 (app/fab.tsx)

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="sk_demo" />
        <Stack.Screen name="mystockDetails" />
      </Stack>

      {/* 🔥 FAB는 여기 있어야 한다. (전체 페이지 공통 UI 영역) */}
      <FloatingSearch />

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
