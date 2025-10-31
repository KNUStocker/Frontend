// app/sk_demo.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function SkDemoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SK 하이닉스 데모 화면</Text>
      <Text style={styles.body}>이 화면이 보이면 라우팅 성공!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1320', padding: 16 },
  title: { fontSize: 22, color: '#E9EDF5', fontWeight: '700', marginBottom: 8 },
  body: { color: '#99A3B2' },
});
