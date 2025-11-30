// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

      {/* ⭐ 반드시 false! 이게 핵심 */}
      <Stack screenOptions={{ headerShown: false }}>

        <Stack.Screen name="(tabs)" />

        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />

 

      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
    </View>

  );
}
