import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuProvider,
  MenuTrigger,
} from "react-native-popup-menu";

// -------------------- 1. API 및 데이터 타입 정의 --------------------
const NEWS_API_URL = "https://backend-production-eb97.up.railway.app/news";
const ANALYSIS_API_URL = "https://backend-production-eb97.up.railway.app/analysis";

interface Article {
  title: string;
  date: string;
  link: string;
  image: string | null;
  content: string;
}

interface CompanyNews {
  company: string;
  news: Article[];
  cached: boolean;
}

interface NewsResponse {
  count: number;
  results: CompanyNews[];
}

// 분석 API 응답 타입 (서버 응답 형태에 따라 수정 가능, 일단 일반적인 형태 가정)
interface AnalysisResponse {
  analysis: string; // 혹은 result, content 등 서버 키값에 맞춤
}

// 날짜 포맷팅 유틸리티
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000 / 60 / 60; // 시간 차이

    if (diff < 1) return "방금 전";
    if (diff < 24) return `${Math.floor(diff)}시간 전`;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  } catch {
    return dateString;
  }
};

// -------------------- 2. 화면 컴포넌트 --------------------
export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 파라미터 안전 처리
  const corpCode = Array.isArray(params.corp_code) ? params.corp_code[0] : params.corp_code;
  const corpName = Array.isArray(params.corp_name) ? params.corp_name[0] : params.corp_name;

  // 상태 관리
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  
  // 뉴스 상태
  const [newsLoading, setNewsLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [newsErrorMsg, setNewsErrorMsg] = useState<string | null>(null);

  // 분석 텍스트 상태
  const [analysisText, setAnalysisText] = useState<string>("AI가 최근 뉴스를 기반으로 분석 중입니다...");

  // -------------------- 3. 데이터 페칭 로직 --------------------
  useEffect(() => {
    if (!corpCode) {
      setNewsLoading(false);
      setAnalysisText("종목 정보를 불러올 수 없습니다.");
      return;
    }

    // (1) 뉴스 데이터 가져오기
    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        const response = await fetch(NEWS_API_URL, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "token": corpCode,
          },
        });

        if (!response.ok) throw new Error(`News API Error: ${response.status}`);

        const data: NewsResponse = await response.json();
        const targetCompany = data.results.find(
          (item) => item.company.trim() === corpName?.trim()
        );

        if (targetCompany) {
          setArticles(targetCompany.news);
        } else {
          setArticles([]);
        }
      } catch (err) {
        console.error("News Fetch Error:", err);
        setNewsErrorMsg("뉴스를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setNewsLoading(false);
      }
    };

    // (2) AI 분석 데이터 가져오기 (요청하신 부분)
    const fetchAnalysis = async () => {
      try {
        // URL 구조: .../analysis/{companyname}
        // 한글 회사명인 경우 인코딩 필요
        const url = `${ANALYSIS_API_URL}/${encodeURIComponent(corpName || "")}`;
        
        console.log("Analysis Request:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "token": corpCode, // 헤더에 token(corpCode) 포함
          },
        });

        if (!response.ok) {
           // 404 등 에러 발생 시 기본 멘트 유지 혹은 에러 멘트
           throw new Error("Analysis API Error");
        }

        const data = await response.json();
        console.log("Analysis Data:", data);

        // 서버 응답 구조에 따라 키값 조정 필요 (예: data.analysis, data.result 등)
        // 여기서는 data.analysis 라고 가정하거나, data 자체가 텍스트일 경우 등을 고려
        const resultText = data.analysis || data.result || data.message || "분석된 내용이 없습니다.";
        
        setAnalysisText(resultText);

      } catch (err) {
        console.error("Analysis Fetch Error:", err);
        setAnalysisText(`${corpName}에 대한 분석 데이터를 불러오지 못했습니다.`);
      }
    };

    fetchNews();
    fetchAnalysis();

  }, [corpCode, corpName]);

  // -------------------- 4. 검색 필터링 --------------------
  const filteredArticles = useMemo(() => {
    const q = query.toLowerCase();
    if (!articles) return [];
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
    );
  }, [query, articles]);

  // 차트 데이터 (더미)
  const pieData = [
    { name: "매수", amount: 65, color: "#10b981", legendFontColor: "#E6EEF8", legendFontSize: 14 },
    { name: "매도", amount: 35, color: "#ef4444", legendFontColor: "#E6EEF8", legendFontSize: 14 },
  ];

  const handleMenuPress = (item: Article, action: 'desc' | 'link') => {
    if (action === 'desc') {
        Alert.alert("내용 미리보기", item.content.slice(0, 200) + (item.content.length > 200 ? "..." : ""));
    } else if (action === 'link') {
        Linking.openURL(item.link).catch(() => Alert.alert("오류", "링크를 열 수 없습니다."));
    }
  };

  return (
    <MenuProvider>
      <LinearGradient colors={["#0b1220", "#111a2e", "#0b1220"]} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          {/* ----------------- 헤더 ----------------- */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={28} color="#E6EEF8" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>{corpName || "종목 상세"}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* ----------------- 차트 ----------------- */}
          <View style={styles.chartContainer}>
            <PieChart
              data={pieData.map((d) => ({
                name: d.name,
                population: d.amount,
                color: d.color,
                legendFontColor: d.legendFontColor,
                legendFontSize: d.legendFontSize,
              }))}
              width={Dimensions.get("window").width - 32}
              height={220}
              chartConfig={{
                backgroundGradientFrom: "#0b1220",
                backgroundGradientTo: "#0b1220",
                color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
              }}
              accessor={"population"}
              backgroundColor="transparent"
              paddingLeft="16"
              absolute
            />
          </View>

          {/* ----------------- AI 분석 (API 데이터 적용) ----------------- */}
          <Text style={styles.analysisTitle}>{corpName ? `${corpName} 분석` : "종목 분석"}</Text>
          <View style={styles.analysisBox}>
            <Text style={styles.analysisText}>
              {analysisText}
            </Text>
          </View>

          {/* ----------------- 뉴스 헤더 ----------------- */}
          <View style={styles.newsHeader}>
            <Text style={styles.newsTitle}>최신 뉴스</Text>
            <View style={styles.iconRow}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="기사 검색..."
                placeholderTextColor="#A3B3D1"
                style={[styles.input, { display: searchOpen ? "flex" : "none" }]}
                autoFocus={searchOpen}
              />
              <TouchableOpacity onPress={() => setSearchOpen(!searchOpen)}>
                <Ionicons
                  name={searchOpen ? "close" : "search"}
                  size={24}
                  color="#4F73FF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ----------------- 뉴스 리스트 ----------------- */}
          {newsLoading ? (
             <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4F73FF" />
                <Text style={{ color: "#8BA1C2", marginTop: 10 }}>뉴스를 불러오는 중...</Text>
             </View>
          ) : (
            <FlatList
                data={filteredArticles}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                const hasImage = item.image && item.image.length > 5;
                const imageSource = hasImage
                    ? { uri: item.image }
                    : { uri: "https://placehold.co/80x80/1e2a44/A3B3D1?text=News" };

                return (
                    <Menu>
                    <MenuTrigger>
                        <TouchableOpacity 
                            style={styles.articleItem}
                            activeOpacity={0.7}
                            onPress={() => handleMenuPress(item, 'link')}
                        >
                        <View style={styles.articleText}>
                            <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.articleCaption} numberOfLines={2}>
                                {item.content.replace(/\n/g, " ")}
                            </Text>
                            <Text style={styles.articleMeta}>
                             뉴스 • {formatDate(item.date)}
                            </Text>
                        </View>
                        <Image source={imageSource} style={styles.articleImage} />
                        </TouchableOpacity>
                    </MenuTrigger>
                    <MenuOptions>
                        <MenuOption onSelect={() => handleMenuPress(item, 'desc')} text="내용 미리보기" />
                        <MenuOption onSelect={() => handleMenuPress(item, 'link')} text="기사 원문 보기" />
                    </MenuOptions>
                    </Menu>
                );
                }}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {newsErrorMsg ? newsErrorMsg : "관련된 최신 뉴스가 없습니다."}
                    </Text>
                }
            />
          )}
        </SafeAreaView>
      </LinearGradient>
    </MenuProvider>
  );
}

// -------------------- 스타일 --------------------
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },

  // 헤더
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#121b2e",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(79, 115, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#E6EEF8" },

  chartContainer: { alignItems: "center", marginTop: 16 },

  analysisBox: {
    backgroundColor: "rgba(79, 115, 255, 0.15)",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 12,
    marginVertical: 8,
    minHeight: 80, // 로딩 중 높이 확보
    justifyContent: 'center'
  },
  analysisText: { color: "#E6EEF8", fontSize: 14, lineHeight: 20 },

  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  newsTitle: { color: "#E6EEF8", fontSize: 18, fontWeight: "700" },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: "#4F73FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    color: "#E6EEF8",
    fontSize: 16,
  },
  analysisTitle: {
    color: "#E6EEF8",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 22,
  },

  articleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#1e2a44",
    paddingVertical: 12,
  },
  articleText: { flex: 1, paddingRight: 8 },
  articleTitle: { fontSize: 16, fontWeight: "bold", color: "#E6EEF8", marginBottom: 6 },
  articleCaption: { fontSize: 14, color: "#A3B3D1", marginBottom: 6 },
  articleMeta: { fontSize: 12, color: "#8BA1C2" },
  articleImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: "#1e2a44" },
  emptyText: { color: "#7E889C", textAlign: "center", marginTop: 40 },
});