// app/(tabs)/(detail)/_layout.tsx
import { Slot } from "expo-router";
import { View } from "react-native";

export default function DetailLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
