import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const API_URL = "https://backend-production-eb97.up.railway.app/news";

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
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [userToken, setUserToken] = useState<string | null>(null);

  // ===== 뉴스 API 호출 =====
  const fetchNews = async (token: string) => {
    try {
      const res = await fetch(API_URL, {
        headers: { token: token },
      });

      if (res.status === 401) {
        Alert.alert("인증 실패", "로그인이 만료되었습니다.");
        setLoading(false);
        return;
      }

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

  // 📌 앱 시작 시 토큰 읽고 뉴스 불러오기
  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          Alert.alert("알림", "로그인 정보가 없습니다.");
          setLoading(false);
          return;
        }

        setUserToken(token);
        fetchNews(token);
      } catch (e) {
        console.error("토큰 로드 실패", e);
        setLoading(false);
      }
    };

    init();
  }, []);

  // 검색 필터
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
      
      {/* 🔥 헤더 + 검색창 상시 표시 */}
      <View style={styles.header}>
        <Text style={styles.title}>Stock Guardian</Text>
      </View>

      {/* 검색창 항상 표시 */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#7E889C" style={{ marginRight: 6 }} />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="검색어를 입력하세요."
          placeholderTextColor="#7E889C"
          style={styles.input}
        />

        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Text style={{ color: "#A3B3D1", fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && <Text style={styles.loadingText}>불러오는 중...</Text>}

      {!loading && (
        <FlatList
          data={filteredNews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {userToken ? "표시할 뉴스가 없습니다." : "먼저 로그인을 해주세요."}
            </Text>
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
    borderBottomWidth: 1,
    borderColor: "#1e2a44",
  },

  title: { fontSize: 22, fontWeight: "800", color: "#E6EEF8" },

  // 🔥 상시 검색창 스타일
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121b2e",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
  },

  input: { flex: 1, color: "#E6EEF8", fontSize: 15 },

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
