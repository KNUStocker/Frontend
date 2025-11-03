// app/(tabs)/shopping_cart.tsx
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Stock = {
  id: string;
  name: string;
  domains: string[];
  emoji: string;
  category: string;
  favorite?: boolean;
  favoriteTime?: number; // 즐겨찾기 시간 기록
};

const STOCKS: Stock[] = [
  { id: '1', name: '삼성전자', domains: ['samsung.com'], emoji: '💻', category: '반도체' },
  { id: '2', name: '현대차', domains: ['hyundai.com'], emoji: '🚗', category: '자동차' },
  { id: '3', name: '카카오', domains: ['kakaocorp.com'], emoji: '📱', category: 'IT/플랫폼' },
  { id: '4', name: 'LG에너지솔루션', domains: ['lgensol.com'], emoji: '🔋', category: '2차전지' },
  { id: '5', name: '포스코홀딩스', domains: ['posco.com'], emoji: '🏗️', category: '소재/철강' },
  { id: '6', name: '셀트리온', domains: ['celltrion.com'], emoji: '💊', category: '바이오' },
  { id: '7', name: 'NAVER', domains: ['naver.com'], emoji: '🌐', category: 'IT/포털' },
  { id: '8', name: '하이브', domains: ['hybecorp.com'], emoji: '🎵', category: '엔터테인먼트' },
  { id: '9', name: '삼성SDI', domains: ['samsungsdi.com'], emoji: '🔋', category: '2차전지' },
  { id: '10', name: '기아', domains: ['kia.com', 'kia.co.kr', 'kiamotors.com'], emoji: '🏎️', category: '자동차' },
  { id: '11', name: 'SK하이닉스', domains: ['skhynix.com'], emoji: '💾', category: '반도체' },
  { id: '12', name: '롯데케미칼', domains: ['lottechem.com'], emoji: '⚗️', category: '화학' },
  { id: '13', name: '신한지주', domains: ['shinhan.com'], emoji: '🏦', category: '금융' },
  { id: '14', name: '롯데쇼핑', domains: ['lotte.com'], emoji: '🛍️', category: '유통' },
  { id: '15', name: 'KT&G', domains: ['ktng.com'], emoji: '🏭', category: '담배/생활' },
];

const SK_ROUTE = '/sk_demo';

export default function WatchlistScreen() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [stocks, setStocks] = useState<Stock[]>(() => {
    // 데모용 초기 상태: 절반 즐겨찾기, SK하이닉스는 즐겨찾기 안됨
    return STOCKS.map((s, i) => ({
      ...s,
      favorite: s.id === '11' ? false : i >= Math.floor(STOCKS.length / 2),
      favoriteTime: s.id === '11' ? undefined : i >= Math.floor(STOCKS.length / 2) ? Date.now() - (STOCKS.length - i) * 1000 : undefined,
    }));
  });

  // 검색 + 즐겨찾기 최근 순 정렬
  const filteredData = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = stocks;
    if (q.length > 0) {
      filtered = stocks.filter(
        (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }
    // 즐겨찾기 최근 순 정렬
    return [...filtered].sort((a, b) => {
      if (a.favorite && b.favorite) return (b.favoriteTime || 0) - (a.favoriteTime || 0);
      if (a.favorite) return -1;
      if (b.favorite) return 1;
      return 0;
    });
  }, [stocks, query]);

  const toggleFavorite = (id: string) => {
    setStocks((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, favorite: !s.favorite, favoriteTime: !s.favorite ? Date.now() : undefined }
          : s
      )
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: Stock }) => (
      <StockCard
        item={item}
        onPress={() => {
          if (item.name === 'SK하이닉스') router.push(SK_ROUTE);
          else console.log(`${item.name} 클릭됨`);
        }}
        onFavorite={() => toggleFavorite(item.id)}
      />
    ),
    [router, stocks]
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>관심 종목</Text>
        <TouchableOpacity
          onPress={() => {
            const next = !searchOpen;
            setSearchOpen(next);
            if (!next) {
              setQuery('');
              Keyboard.dismiss();
            }
          }}
        >
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149852.png' }}
            style={styles.searchIcon}
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
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>검색 결과가 없어요.</Text>}
      />
    </View>
  );
}

function StockCard({ item, onPress, onFavorite }: { item: Stock; onPress?: () => void; onFavorite?: () => void }) {
  const [idx, setIdx] = useState(0);
  const [allFailed, setAllFailed] = useState(false);
  const domain = item.domains[idx];
  const uri = domain ? `https://logo.clearbit.com/${domain}` : undefined;

  const handleError = () => {
    if (idx < item.domains.length - 1) setIdx(idx + 1);
    else setAllFailed(true);
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
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

      {/* 즐겨찾기 버튼 */}
      <TouchableOpacity onPress={onFavorite} style={styles.favoriteBtn}>
        <Text style={{ fontSize: 20, color: item.favorite ? '#FFD700' : '#7E889C' }}>
          {item.favorite ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1320' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#1E2A44',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#E9EDF5' },
  searchIcon: { width: 20, height: 20, tintColor: '#4F73FF' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#191E2C',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  listContainer: { padding: 16, paddingBottom: 30 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#191E2C',
    borderRadius: 16,
    padding: 14,
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
  name: { fontSize: 16, fontWeight: '700', color: '#E9EDF5' },
  category: { fontSize: 13, color: '#8B93A7', marginTop: 2 },
  favoriteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  emptyText: { color: '#7E889C', textAlign: 'center', marginTop: 40, fontSize: 14 },
});
