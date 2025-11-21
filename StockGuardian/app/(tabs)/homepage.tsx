import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type Article = {
  id: string;
  title: string;
  caption: string;
  user: string;
  timestamp: string;
  imageUri: string;
};

const FEED_DATA: Article[] = [
  {
    id: "1",
    title: "삼성전자, 반도체 실적 발표로 주가 상승",
    caption: "삼성전자의 최신 반도체 실적 발표에 투자자들의 관심이 집중되고 있습니다.",
    user: "Stock Guardian",
    timestamp: "1시간 전",
    imageUri: "https://logo.clearbit.com/samsung.com"
  },
  {
    id: "2",
    title: "현대차, 전기차 판매 호조로 강세",
    caption: "현대차 전기차 판매량 증가로 국내외 주식 시장에서 강세를 보이고 있습니다.",
    user: "Stock Guardian",
    timestamp: "2시간 전",
    imageUri: "https://logo.clearbit.com/hyundai.com"
  },
  {
    id: "3",
    title: "카카오, 플랫폼 수익 증가 기대감",
    caption: "카카오의 신규 서비스 확장으로 플랫폼 수익 증가 기대감이 커지고 있습니다.",
    user: "Stock Guardian",
    timestamp: "3시간 전",
    imageUri: "https://logo.clearbit.com/kakaocorp.com"
  },
  {
    id: "4",
    title: "LG에너지솔루션, 2차전지 시장 점유율 확대",
    caption: "LG에너지솔루션이 글로벌 2차전지 시장에서 점유율 확대에 나섰습니다.",
    user: "Stock Guardian",
    timestamp: "4시간 전",
    imageUri: "https://logo.clearbit.com/lgensol.com"
  },
  {
    id: "5",
    title: "포스코홀딩스, 철강 가격 상승으로 호재",
    caption: "포스코홀딩스가 글로벌 철강 가격 상승에 따라 실적 호조가 예상됩니다.",
    user: "Stock Guardian",
    timestamp: "5시간 전",
    imageUri: "https://logo.clearbit.com/posco.com"
  },
  {
    id: "6",
    title: "셀트리온, 바이오 신약 개발 기대감",
    caption: "셀트리온의 신약 임상 결과 기대감으로 바이오 섹터 투자자들의 관심 증가.",
    user: "Stock Guardian",
    timestamp: "6시간 전",
    imageUri: "https://logo.clearbit.com/celltrion.com"
  },
  {
    id: "7",
    title: "NAVER, 검색·광고 수익 상승",
    caption: "NAVER의 검색 및 광고 수익 증가로 IT/포털 업종에서 긍정적 평가.",
    user: "Stock Guardian",
    timestamp: "7시간 전",
    imageUri: "https://logo.clearbit.com/naver.com"
  },
  {
    id: "8",
    title: "하이브, 음반 및 공연 매출 증가",
    caption: "하이브의 글로벌 음반 및 공연 매출이 증가하며 엔터테인먼트 업종 주가 상승.",
    user: "Stock Guardian",
    timestamp: "8시간 전",
    imageUri: "https://logo.clearbit.com/hybecorp.com"
  },
  {
    id: "9",
    title: "삼성SDI, 전기차 배터리 수요 확대",
    caption: "삼성SDI의 전기차 배터리 공급 확대 소식에 주가 강세.",
    user: "Stock Guardian",
    timestamp: "9시간 전",
    imageUri: "https://logo.clearbit.com/samsungsdi.com"
  },
  {
    id: "10",
    title: "기아, 신차 출시 기대감에 주가 상승",
    caption: "기아의 신차 모델 출시 기대감으로 자동차 섹터 주가가 상승 중입니다.",
    user: "Stock Guardian",
    timestamp: "10시간 전",
    imageUri: "https://logo.clearbit.com/kia.com"
  },
  {
    id: "11",
    title: "SK하이닉스, 반도체 수급 호조로 강세",
    caption: "SK하이닉스가 글로벌 반도체 수급 호조에 따라 투자자 관심이 집중되고 있습니다.",
    user: "Stock Guardian",
    timestamp: "11시간 전",
    imageUri: "https://logo.clearbit.com/skhynix.com"
  },
  {
    id: "12",
    title: "롯데케미칼, 화학 제품 가격 상승 영향",
    caption: "롯데케미칼의 화학 제품 가격 상승으로 실적 개선 기대.",
    user: "Stock Guardian",
    timestamp: "12시간 전",
    imageUri: "https://logo.clearbit.com/lottechem.com"
  },
  {
    id: "13",
    title: "신한지주, 금융 이익 증가 전망",
    caption: "신한지주의 금융 이익 증가로 은행·금융 섹터에 긍정적 신호.",
    user: "Stock Guardian",
    timestamp: "13시간 전",
    imageUri: "https://logo.clearbit.com/shinhan.com"
  },
  {
    id: "14",
    title: "롯데쇼핑, 유통 매출 회복 기대",
    caption: "롯데쇼핑의 유통 매출 회복 기대감으로 관련 주가 상승.",
    user: "Stock Guardian",
    timestamp: "14시간 전",
    imageUri: "https://logo.clearbit.com/lotte.com"
  },
  {
    id: "15",
    title: "KT&G, 담배·생활용품 수익 안정적",
    caption: "KT&G의 담배 및 생활용품 수익이 안정적으로 유지되며 투자자 관심.",
    user: "Stock Guardian",
    timestamp: "15시간 전",
    imageUri: "https://logo.clearbit.com/ktng.com"
  },
];


export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredArticles = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return FEED_DATA;
    return FEED_DATA.filter(
      (a) => a.title.toLowerCase().includes(q) || a.caption.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>Stock Guardian</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => setSearchOpen(!searchOpen)}>
            <Ionicons name="search" size={24} color="#4F73FF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 검색창 */}
      {searchOpen && (
        <View style={styles.searchBar}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="기사 검색..."
            placeholderTextColor="#7E889C"
            style={styles.input}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.articleItem}>
            <View style={styles.articleText}>
              <Text style={styles.articleTitle}>{item.title}</Text>
              <Text style={styles.articleCaption}>{item.caption}</Text>
              <Text style={styles.articleMeta}>
                {item.user} • {item.timestamp}
              </Text>
            </View>
            <Image source={{ uri: item.imageUri }} style={styles.articleImage} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>검색 결과가 없어요.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },
  header: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderColor: "#1e2a44" },
  title: { fontSize: 22, fontWeight: "800", color: "#E6EEF8" },
  iconRow: { flexDirection: "row", gap: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#121b2e", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 16, marginTop: 8 },
  input: { flex: 1, color: "#E6EEF8", fontSize: 15 },
  clearBtn: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: "#2A2E3A" },
  clearText: { color: "#E6EEF8", fontSize: 12 },
  articleItem: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderColor: "#1e2a44", paddingVertical: 12 },
  articleText: { flex: 1, paddingRight: 8 },
  articleTitle: { fontSize: 16, fontWeight: "bold", color: "#E6EEF8", marginBottom: 8 },
  articleCaption: { fontSize: 14, color: "#A3B3D1", marginBottom: 8 },
  articleMeta: { fontSize: 12, color: "#8BA1C2" },
  articleImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: "#1e2a44" },
  emptyText: { color: "#7E889C", textAlign: "center", marginTop: 40 },
});
