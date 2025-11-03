// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="homepage"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mystock"
        options={{
          title: '장바구니',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
