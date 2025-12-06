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
import { LineChart } from "react-native-chart-kit";
// 📌 MenuProvider 다시 추가!
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  MenuProvider, 
} from "react-native-popup-menu";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface InvestorHistory {
  date: string;
  personal: number;
  foreigner: number;
  institution: number;
}

interface InvestorData {
  personal: number;
  foreigner: number;
  institution: number;
}

interface StockData {
  company: string;
  corp_code: string;
  metrics?: {
    investors?: {
      cumulative_net: InvestorData;
      cumulative_buy: InvestorData;
      cumulative_sell: InvestorData;
      history: InvestorHistory[];
    };
  };
  gemini_output?: string;
  analysis?: string;
}

// [유틸] 금액 포맷팅 (억 단위 변환)
// [유틸] 금액 포맷팅 (억 단위 변환 + 3자리 콤마)
const formatMoney = (amount: number) => {
  const inUk = amount / 100000000; // 억 단위로 변환
  const rounded = Math.round(inUk); // 소수점 반올림 (음수도 안전)

  // 1,234억 이런 식으로 표기
  return `${rounded.toLocaleString()}억`;
};


// [유틸] 날짜 포맷팅
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000 / 60 / 60;
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

  const corpCode = Array.isArray(params.corp_code) ? params.corp_code[0] : params.corp_code;
  const corpName = Array.isArray(params.corp_name) ? params.corp_name[0] : params.corp_name;

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [newsLoading, setNewsLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [newsErrorMsg, setNewsErrorMsg] = useState<string | null>(null);

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [analysisText, setAnalysisText] = useState<string>("AI가 데이터를 분석 중입니다...");

  // -------------------- 3. 데이터 페칭 로직 (수정됨) --------------------
// -------------------- 3. 데이터 페칭 로직 (수정됨) --------------------
  useEffect(() => {
    const initPage = async () => {
      
      // ============================================================
      // 🔥 [핵심 수정] 새로운 종목이 들어오면 기존 데이터를 즉시 초기화
      // ============================================================
      setStockData(null); // 차트 및 수급 데이터 초기화
      setArticles([]); // 뉴스 리스트 초기화
      setAnalysisText("AI가 데이터를 분석 중입니다..."); // 분석 텍스트 초기화
      setNewsLoading(true); // 로딩 상태 강제 시작
      
      
      // 1. 필수 값 체크
      if (!corpName) {
        setNewsLoading(false);
        setAnalysisText("종목 정보가 올바르지 않습니다.");
        return;
      }

      // 2. 폰에 저장된 토큰 꺼내기
      const userToken = await AsyncStorage.getItem('userToken');

      if (!userToken) {
        Alert.alert("알림", "로그인이 필요합니다.");
        setNewsLoading(false);
        setAnalysisText("로그인이 필요합니다.");
        return;
      }

      // 3. API 호출
      fetchNews(userToken);
      fetchAnalysis(userToken);
    };

    initPage();
  }, [corpCode, corpName]); // 종목 코드나 이름이 바뀌면 실행됨


  // A. 뉴스 API
  const fetchNews = async (token: string) => {
    try {
      setNewsLoading(true);
      const response = await fetch(NEWS_API_URL, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "token": token, // 🔥 Header: 진짜 유저 토큰
        },
      });

      if (!response.ok) throw new Error(`News API Error: ${response.status}`);

      const data: any = await response.json();
      const targetCompany = data.results?.find(
        (item: any) => item.company.trim() === corpName?.trim()
      );

      setArticles(targetCompany ? targetCompany.news : []);
    } catch (err) {
      console.error("News Fetch Error:", err);
      setNewsErrorMsg("뉴스를 불러오지 못했습니다.");
    } finally {
      setNewsLoading(false);
    }
  };

  // B. 분석 API
  const fetchAnalysis = async (token: string) => {
    try {
      // 🔥 URL Path: 종목 이름
      const url = `${ANALYSIS_API_URL}/${encodeURIComponent(corpName || "")}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "token": token, // 🔥 Header: 진짜 유저 토큰
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        console.log("Analysis API Error:", errText);
        throw new Error(`Analysis API Error: ${response.status}`);
      }

      const data: StockData = await response.json();
      setStockData(data);

      const resultText = data.gemini_output || data.analysis || "분석된 내용이 없습니다.";
      setAnalysisText(resultText);

    } catch (err) {
      console.error("Analysis Fetch Error:", err);
      setAnalysisText(`${corpName} 분석 데이터를 불러오지 못했습니다.`);
      // 화면 안 깨지게 기본값 설정
      setStockData({ company: corpName || "", corp_code: corpCode || "" }); 
    }
  };


  // -------------------- 4. 차트 데이터 가공 --------------------
  const investors = stockData?.metrics?.investors;

  const lineChartData = useMemo(() => {
    if (!investors?.history || investors.history.length === 0) return null;

    const history = investors.history;
    const labels = history.map(item => item.date.slice(5, 10));
    const sampledLabels = labels.map((label, index) => index % 5 === 0 ? label : '');

    return {
      labels: sampledLabels,
      datasets: [
        {
          data: history.map(item => item.personal / 100000000),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          name: "개인",
        },
        {
          data: history.map(item => item.foreigner / 100000000),
          color: (opacity = 1) => `rgba(79, 115, 255, ${opacity})`,
          name: "외국인",
        },
        {
          data: history.map(item => item.institution / 100000000),
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          name: "기관",
        },
      ],
      legend: ["개인", "외국인", "기관"],
    };
  }, [investors]);


  // -------------------- 5. 렌더링 --------------------
  const filteredArticles = useMemo(() => {
    const q = query.toLowerCase();
    if (!articles) return [];
    if (!q) return articles;
    return articles.filter(a => a.title.toLowerCase().includes(q));
  }, [query, articles]);

  const handleMenuPress = (item: Article, action: 'desc' | 'link') => {
    if (action === 'desc') {
      Alert.alert("내용 미리보기", item.content.slice(0, 200) + "...");
    } else {
      Linking.openURL(item.link).catch(() => Alert.alert("오류", "링크를 열 수 없습니다."));
    }
  };

  const chartConfig = {
    backgroundGradientFrom: "#1e2a44",
    backgroundGradientTo: "#1e2a44",
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    propsForDots: { r: "4", strokeWidth: "1", stroke: "#4F73FF" },
    fillShadowGradientFrom: "#4F73FF",
    fillShadowGradientTo: "#1e2a44",
  };

  // 🔥 MenuProvider 다시 추가! skipInstanceCheck로 중복 경고 방지
  return (
    <MenuProvider skipInstanceCheck>
      <LinearGradient colors={["#0b1220", "#111a2e", "#0b1220"]} style={styles.gradient}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                  router.push("/mystock");
              }}
            >
              <Ionicons name="arrow-back" size={28} color="#E6EEF8" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{corpName || "종목 상세"}</Text>
            <View style={{ width: 40 }} />
          </View>

          <FlatList
            style={{ flex: 1 }}
            data={filteredArticles}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.flatListContent}
            ListHeaderComponent={
              <>
                {/* 차트 섹션 */}
                <View style={styles.chartSection}>
                  <Text style={styles.sectionTitle}>📈 투자자별 일간 순매수 동향 (억 원)</Text>

                  {lineChartData ? (
                    <View style={{ alignItems: 'center' }}>
                      <View style={styles.legendContainer}>
                        {lineChartData.legend.map((name, index) => {
                          const color = lineChartData.datasets[index].color(1);
                          return (
                            <View key={name} style={styles.legendItem}>
                              <View style={[styles.legendColor, { backgroundColor: color }]} />
                              <Text style={styles.legendText}>{name}</Text>
                            </View>
                          )
                        })}
                      </View>
                      <LineChart
                        data={lineChartData}
                        width={Dimensions.get("window").width - 32}
                        height={250}
                        chartConfig={chartConfig}
                        style={{ borderRadius: 16, marginVertical: 8 }}
                        bezier
                        withVerticalLines={false}
                      />
                    </View>
                  ) : (
                    <View style={[styles.loadingBox, { height: 250 }]}>
                      {analysisText === "AI가 데이터를 분석 중입니다..." ? (
                         <>
                            <ActivityIndicator color="#4F73FF" />
                            <Text style={styles.loadingText}>매매 데이터 분석 중...</Text>
                         </>
                      ) : (
                         <Text style={{color: '#8BA1C2'}}>차트 데이터를 불러올 수 없습니다.</Text>
                      )}
                    </View>
                  )}

                  {/* 테이블 섹션 */}
                  {investors?.cumulative_net && (
                    <View style={styles.tableContainer}>
                      <Text style={styles.tableTitle}>누적 순매수 현황 (최근 기간)</Text>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.th, { flex: 0.8 }]}>구분</Text>
                        <Text style={styles.th}>매수</Text>
                        <Text style={styles.th}>매도</Text>
                        <Text style={styles.th}>순매수</Text>
                      </View>
                      {/* 개인 */}
                      <View style={styles.tableRow}>
                        <Text style={[styles.td, { flex: 0.8, color: '#A3B3D1' }]}>개인</Text>
                        <Text style={[styles.td, { color: '#ef4444' }]}>{formatMoney(investors.cumulative_buy.personal)}</Text>
                        <Text style={[styles.td, { color: '#3b82f6' }]}>{formatMoney(investors.cumulative_sell.personal)}</Text>
                        <Text style={[styles.td, { fontWeight: 'bold', color: investors.cumulative_net.personal > 0 ? '#ef4444' : '#10b981' }]}>
                          {formatMoney(investors.cumulative_net.personal)}
                        </Text>
                      </View>
                      {/* 외국인 */}
                      <View style={styles.tableRow}>
                        <Text style={[styles.td, { flex: 0.8, color: '#A3B3D1' }]}>외국인</Text>
                        <Text style={[styles.td, { color: '#ef4444' }]}>{formatMoney(investors.cumulative_buy.foreigner)}</Text>
                        <Text style={[styles.td, { color: '#3b82f6' }]}>{formatMoney(investors.cumulative_sell.foreigner)}</Text>
                        <Text style={[styles.td, { fontWeight: 'bold', color: investors.cumulative_net.foreigner > 0 ? '#ef4444' : '#10b981' }]}>
                          {formatMoney(investors.cumulative_net.foreigner)}
                        </Text>
                      </View>
                      {/* 기관 */}
                      <View style={styles.tableRow}>
                        <Text style={[styles.td, { flex: 0.8, color: '#A3B3D1' }]}>기관</Text>
                        <Text style={[styles.td, { color: '#ef4444' }]}>{formatMoney(investors.cumulative_buy.institution)}</Text>
                        <Text style={[styles.td, { color: '#3b82f6' }]}>{formatMoney(investors.cumulative_sell.institution)}</Text>
                        <Text style={[styles.td, { fontWeight: 'bold', color: investors.cumulative_net.institution > 0 ? '#ef4444' : '#10b981' }]}>
                          {formatMoney(investors.cumulative_net.institution)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* AI 분석 섹션 */}
                <Text style={styles.analysisTitle}>{corpName ? `${corpName} AI 요약` : "종목 분석"}</Text>
                <View style={styles.analysisBox}>
                  <Text style={styles.analysisText}>{analysisText}</Text>
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
        
              </>
            }
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
                  onPress={() =>
                    router.push({
                      pathname: "/news_detail",
                      params: {
                        title: item.title,
                        content: item.content,
                        date: item.date,
                        // 이 화면에서는 Article 타입에 company가 없으니까 corpName 사용
                        company: corpName ?? "",
                        image: item.image ?? "",
                        link: item.link,
                      },
                    })
                  }
                >
                  <View style={styles.articleText}>
                    <Text style={styles.articleTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
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

              {/* 팝업 메뉴는 유지하고 싶으면 그대로 두기 */}
              <MenuOptions>
                <MenuOption
                  onSelect={() => handleMenuPress(item, "desc")}
                  text="내용 미리보기"
                />
                <MenuOption
                  onSelect={() => handleMenuPress(item, "link")}
                  text="기사 원문 보기"
                />
              </MenuOptions>
            </Menu>
          );
        }}

            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              newsLoading ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#4F73FF" />
                  <Text style={{ color: "#8BA1C2", marginTop: 10 }}>로딩 중...</Text>
                </View>
              ) : (
                <Text style={styles.emptyText}>{newsErrorMsg || "관련된 최신 뉴스가 없습니다."}</Text>
              )
            }
          />
        </SafeAreaView>
      </LinearGradient>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  flatListContent: { paddingBottom: 40, flexGrow: 1 },
  chartSection: { marginVertical: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#E6EEF8', marginLeft: 22, marginBottom: 4 },
  loadingBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 42, 68, 0.5)',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    marginTop: 10
  },
  loadingText: { color: "#8BA1C2", marginTop: 10 },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 30,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendColor: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { color: '#E6EEF8', fontSize: 13 },
  tableContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "rgba(30, 42, 68, 0.5)",
    borderRadius: 12,
    padding: 12,
  },
  tableTitle: { color: '#E6EEF8', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#4F73FF", paddingBottom: 8, marginBottom: 8 },
  tableRow: { flexDirection: "row", marginBottom: 8 },
  th: { flex: 1, color: "#E6EEF8", fontWeight: "bold", textAlign: "center", fontSize: 12 },
  td: { flex: 1, color: "#E6EEF8", textAlign: "center", fontSize: 12 },
  analysisTitle: {
    color: "#E6EEF8",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 22,
    marginTop: 10,
  },
  analysisBox: {
    backgroundColor: "rgba(79, 115, 255, 0.15)",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    marginVertical: 8,
    minHeight: 80,
  },
  analysisText: { color: "#E6EEF8", fontSize: 14, lineHeight: 22 },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
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
    minWidth: 150,
  },
  articleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(30, 42, 68, 0.3)",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 12,
  },
  articleText: { flex: 1, paddingRight: 10 },
  articleTitle: { fontSize: 15, fontWeight: "bold", color: "#E6EEF8", marginBottom: 6 },
  articleCaption: { fontSize: 13, color: "#A3B3D1", marginBottom: 6, lineHeight: 18 },
  articleMeta: { fontSize: 12, color: "#8BA1C2" },
  articleImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: "#1e2a44" },
  emptyText: { color: "#7E889C", textAlign: "center", marginTop: 40 },
});