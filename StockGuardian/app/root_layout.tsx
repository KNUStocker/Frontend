// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)', // 탭을 초기 진입점으로
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* 전역에서 header 숨김 */}
      <Stack screenOptions={{ headerShown: true }}>
        {/* 탭 그룹 */}
        <Stack.Screen name="(tabs)" />
        {/* 모달(원래 있던 거 유지) */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        {/* ✅ 상세 화면: /sk_demo */}
        <Stack.Screen name="sk_demo" />
        <Stack.Screen name="mystockDetails" />
        
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
