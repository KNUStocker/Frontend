import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const API_URL = "https://backend-production-eb97.up.railway.app/news";
const TEMP_TOKEN = "cheerhow";

// ===== 서버 응답 타입 =====
interface NewsDetail {
  title: string;
  date: string;
  link: string;
  image: string | null;
  content: string;
}

interface NewsCompany {
  company: string;
  news: NewsDetail[];
  error?: string;
}

interface NewsResponse {
  count: number;
  results: NewsCompany[];
}

// ===== 앱 내부에서 사용하는 뉴스 타입 =====
interface NewsItem {
  id: string;
  company: string;
  title: string;
  content: string;
  date: string;
  link: string;
  image: string | null;
}

// HTML 엔티티 → 텍스트로 변환
function htmlDecode(str: string): string {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

// 날짜 → "n시간 전"
function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000 / 3600;

    if (diff < 1) return "방금 전";
    return `${Math.floor(diff)}시간 전`;
  } catch {
    return "시간 정보 없음";
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ===== 뉴스 API 호출 =====
  const fetchNews = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { token: TEMP_TOKEN },
      });

      const data: NewsResponse = await res.json();
      const parsed: NewsItem[] = [];

      data.results.forEach((companyData) => {
        if (!companyData.news || companyData.news.length === 0) return;

        companyData.news.forEach((n, idx) => {
          parsed.push({
            id: `${companyData.company}-${idx}`,
            company: companyData.company,
            title: htmlDecode(n.title),
            content: htmlDecode(n.content),
            date: n.date,
            link: n.link,
            image: n.image,
          });
        });
      });

      parsed.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setNewsList(parsed);
    } catch (e) {
      console.error("뉴스 로딩 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // 검색
  const filteredNews = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return newsList;

    return newsList.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.company.toLowerCase().includes(q)
    );
  }, [query, newsList]);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>Stock Guardian</Text>

        <TouchableOpacity onPress={() => setSearchOpen(!searchOpen)}>
          <Ionicons name="search" size={24} color="#4F73FF" />
        </TouchableOpacity>
      </View>

      {/* 검색창 */}
      {searchOpen && (
        <View style={styles.searchBar}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="뉴스 검색..."
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

      {loading && <Text style={styles.loadingText}>불러오는 중...</Text>}

      {!loading && (
        <FlatList
          data={filteredNews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>먼저 관심 종목을 장바구니에 담아주세요!</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/news_detail",
                  params: {
                    title: item.title,
                    content: item.content,
                    date: item.date,
                    company: item.company,
                    image: item.image ?? "",
                    link: item.link,
                  },
                })
              }
            >
              <View style={styles.articleText}>
                <Text style={styles.metaText}>
                  {item.company} • {formatTime(item.date)}
                </Text>

                <Text style={styles.articleTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <Text style={styles.articleCaption} numberOfLines={3}>
                  {item.content}
                </Text>
              </View>

              <View style={styles.imageWrap}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.articleImage} />
                ) : (
                  <View style={styles.emptyImage} />
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1220" },

  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#1e2a44",
  },

  title: { fontSize: 22, fontWeight: "800", color: "#E6EEF8" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121b2e",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },

  input: { flex: 1, color: "#E6EEF8", fontSize: 15 },

  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "#2A2E3A",
  },

  clearText: { color: "#E6EEF8", fontSize: 12 },

  loadingText: {
    marginTop: 20,
    color: "#E6EEF8",
    textAlign: "center",
  },

  emptyText: { color: "#7E889C", textAlign: "center", marginTop: 40 },

  card: {
    flexDirection: "row",
    backgroundColor: "#121b2e",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderColor: "#1e2a44",
  },

  articleText: { flex: 1 },

  metaText: { color: "#8BA1C2", fontSize: 12, marginBottom: 4 },

  articleTitle: { fontSize: 16, fontWeight: "bold", color: "#E6EEF8" },

  articleCaption: {
    fontSize: 14,
    color: "#A3B3D1",
    marginTop: 6,
  },

  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1e2a44",
  },

  articleImage: { width: "100%", height: "100%" },

  emptyImage: { flex: 1 },
});
