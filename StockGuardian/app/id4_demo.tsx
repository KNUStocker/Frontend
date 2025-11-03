import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

type Article = {
  id: string;
  title: string;
  caption: string;
  timestamp: string;
};

const ID4_ARTICLES: Article[] = [
  {
    id: '4-1',
    title: '테슬라 신모델 출시, SK하이닉스 반도체 수요 영향',
    caption: '테슬라 신모델 발표로 인해 차량용 반도체 수요가 증가하며 SK하이닉스 관련 부품 주문 증가 예상.',
    timestamp: '2시간 전',
  },
  {
    id: '4-2',
    title: 'SK하이닉스, 자동차용 반도체 신규 공급 계약 체결',
    caption: 'SK하이닉스가 글로벌 자동차 업체와 신규 반도체 공급 계약을 체결했습니다.',
    timestamp: '5시간 전',
  },
  {
    id: '4-3',
    title: 'SK하이닉스, 테슬라 협력 확대 기대감',
    caption: '테슬라와 협력을 확대함에 따라 SK하이닉스 매출 성장 기대감이 높아지고 있습니다.',
    timestamp: '1일 전',
  },
];

export default function ID4Demo() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>SK하이닉스 관련 기사</Text>
      <FlatList
        data={ID4_ARTICLES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.articleItem}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.caption}>{item.caption}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#E6EEF8', marginBottom: 16 },
  articleItem: { padding: 12, borderRadius: 8, backgroundColor: '#121b2e' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#E6EEF8', marginBottom: 6 },
  caption: { fontSize: 14, color: '#A3B3D1', marginBottom: 4 },
  timestamp: { fontSize: 12, color: '#8BA1C2' },
});
