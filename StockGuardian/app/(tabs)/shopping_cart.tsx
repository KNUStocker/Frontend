// app/(tabs)/shopping_cart.tsx
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

type Stock = {
  id: string;
  name: string;
  domains: string[];   // 로고 후보 도메인 (Clearbit)
  emoji: string;       // 로고 실패 시 폴백 이모지
  category: string;
};

const STOCKS: Stock[] = [
  { id: '1',  name: '삼성전자',       domains: ['samsung.com'],                          emoji: '💻', category: '반도체' },
  { id: '2',  name: '현대차',         domains: ['hyundai.com'],                          emoji: '🚗', category: '자동차' },
  { id: '3',  name: '카카오',         domains: ['kakaocorp.com'],                        emoji: '📱', category: 'IT/플랫폼' },
  { id: '4',  name: 'LG에너지솔루션',  domains: ['lgensol.com'],                          emoji: '🔋', category: '2차전지' },
  { id: '5',  name: '포스코홀딩스',    domains: ['posco.com'],                           emoji: '🏗️', category: '소재/철강' },
  { id: '6',  name: '셀트리온',       domains: ['celltrion.com'],                        emoji: '💊', category: '바이오' },
  { id: '7',  name: 'NAVER',          domains: ['naver.com'],                            emoji: '🌐', category: 'IT/포털' },
  { id: '8',  name: '하이브',         domains: ['hybecorp.com'],                         emoji: '🎵', category: '엔터테인먼트' },
  { id: '9',  name: '삼성SDI',        domains: ['samsungsdi.com'],                       emoji: '🔋', category: '2차전지' },
  { id: '10', name: '기아',           domains: ['kia.com', 'kia.co.kr', 'kiamotors.com'],emoji: '🏎️', category: '자동차' },
  { id: '11', name: 'SK하이닉스',      domains: ['skhynix.com'],                         emoji: '💾', category: '반도체' },
  { id: '12', name: '롯데케미칼',      domains: ['lottechem.com'],                       emoji: '⚗️', category: '화학' },
  { id: '13', name: '신한지주',        domains: ['shinhan.com'],                         emoji: '🏦', category: '금융' },
  { id: '14', name: '롯데쇼핑',        domains: ['lotte.com'],                           emoji: '🛍️', category: '유통' },
  { id: '15', name: 'KT&G',           domains: ['ktng.com'],                            emoji: '🏭', category: '담배/생활' },
];

const SK_ROUTE = '/sk_demo';

export default function WatchlistScreen() {
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STOCKS;
    return STOCKS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q),
    );
  }, [query]);

  const renderItem = useCallback(
    ({ item }: { item: Stock }) => (
      <StockCard
        item={item}
        onPress={() => {
          if (item.name === 'SK하이닉스') {
            router.push(SK_ROUTE); // 또는 router.replace(SK_ROUTE)
          } else {
            console.log(`${item.name} 클릭됨`);
          }
        }}
      />
    ),
    [router]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>관심 종목</Text>
      <Text style={styles.subtitle}>장바구니</Text>

      {/* 검색 버튼 */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {
            const next = !searchOpen;
            setSearchOpen(next);
            if (!next) {
              setQuery('');
              Keyboard.dismiss();
            }
          }}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149852.png' }}
            style={{ width: 20, height: 20, tintColor: '#fff' }}
          />
        </TouchableOpacity>
      </View>

      {/* 검색창 */}
      {searchOpen && (
        <View style={styles.searchBar}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="종목 이름/업종 검색"
            placeholderTextColor="#7E889C"
            style={styles.input}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.emptyText}>검색 결과가 없어요.</Text>}
      />
    </View>
  );
}

function StockCard({ item, onPress }: { item: Stock; onPress?: () => void }) {
  const [idx, setIdx] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  const domain = item.domains[idx];
  const uri = domain ? `https://logo.clearbit.com/${domain}` : undefined;

  const handleError = () => {
    if (idx < item.domains.length - 1) setIdx(idx + 1);
    else setAllFailed(true);
  };

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.card} onPress={onPress}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          {!allFailed && uri ? (
            <Image source={{ uri }} style={styles.logo} resizeMode="contain" onError={handleError} />
          ) : (
            <Text style={styles.icon}>{item.emoji}</Text>
          )}
        </View>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1320', padding: 16 },
  title: { fontSize: 22, color: '#E9EDF5', fontWeight: '700' },
  subtitle: { color: '#99A3B2', marginBottom: 10 },
  topBar: { alignItems: 'flex-end', marginVertical: 10 },
  searchButton: { backgroundColor: '#191E2C', borderRadius: 10, padding: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191E2C',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  input: { flex: 1, color: '#E9EDF5', fontSize: 15 },
  clearBtn: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#2A2E3A',
  },
  clearText: { color: '#E9EDF5', fontSize: 12 },
  list: { paddingBottom: 30 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191E2C',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2A2E3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 36, height: 36, borderRadius: 6 },
  icon: { fontSize: 24 },
  name: { color: '#E9EDF5', fontSize: 16, fontWeight: '700' },
  category: { color: '#8B93A7', fontSize: 13, marginTop: 2 },
  emptyText: { color: '#7E889C', textAlign: 'center', marginTop: 40, fontSize: 14 },
});
