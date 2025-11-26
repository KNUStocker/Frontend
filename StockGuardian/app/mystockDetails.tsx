import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

// ------------------------------------
// 1. API 설정 및 데이터 타입 정의
// ------------------------------------

const API_URL = "https://backend-production-eb97.up.railway.app/news";

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

// ------------------------------------
// 2. 유틸리티 함수
// ------------------------------------

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}. ${month}. ${day}. ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

const handleLinkPress = (link: string) => {
  Alert.alert("링크 열기", `이 기사를 외부 브라우저에서 엽니다:\n${link}`, [
    { text: "취소" },
    { text: "확인" },
    // 실제 앱: Linking.openURL(link);
  ]);
};

// ------------------------------------
// 3. 뉴스 아티클 컴포넌트
// ------------------------------------

const NewsArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  const formattedDate = formatDate(article.date);
  const hasImage = article.image && article.image.length > 5;
  const imageUrl = hasImage
    ? article.image
    : "https://placehold.co/100x100/1e2a44/E6EEF8?text=NO+IMAGE";

  return (
    <TouchableOpacity
      style={newsStyles.cardContainer}
      onPress={() => handleLinkPress(article.link)}
      activeOpacity={0.8}
    >
      <View style={newsStyles.contentWrapper}>
        <Text style={newsStyles.cardTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={newsStyles.cardDate}>{formattedDate}</Text>
      </View>

      <Image
        source={{ uri: imageUrl || "" }}
        style={newsStyles.cardImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

// ------------------------------------
// 4. 메인 뉴스 화면 컴포넌트
// ------------------------------------

const mystockDetails: React.FC = () => {
  const router = useRouter();
  
  // URL 파라미터 받기
  const params = useLocalSearchParams();
  
  // 배열일 경우 첫 번째 값 사용, 아니면 그대로 사용 (안전한 파싱)
  const corpCode = Array.isArray(params.corp_code) ? params.corp_code[0] : params.corp_code;
  const corpName = Array.isArray(params.corp_name) ? params.corp_name[0] : params.corp_name;

  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
useEffect(() => {
  if (!corpCode) {
    setLoading(false);
    setErrorMsg("토큰(corp_code)이 전달되지 않았습니다.");
    return;
  }

  const fetchNews = async () => {
    try {
      setLoading(true);

      console.log("API 요청(GET) 헤더 방식:", { token: corpCode });

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "token": corpCode, // 헤더에 token 넣기
        },
      });

      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }

      const data: NewsResponse = await response.json();
      console.log("API 응답 데이터:", data);

      const targetCompany = data.results.find(
        (item) => item.company.trim() === corpName?.trim()
      );

      if (targetCompany) setArticles(targetCompany.news);
      else setArticles([]);
    } catch (err) {
      console.error("News Fetch Error:", err);
      setErrorMsg("뉴스를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  fetchNews();
}, [corpCode, corpName]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* 상단 네비게이션 */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ color: "white", fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>
            {corpName ? `${corpName} 뉴스` : "종목 뉴스"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {corpName
              ? `${corpName}와 관련된 최신 기사입니다.`
              : "종목을 선택하지 않았습니다."}
          </Text>
        </View>

        {/* 로딩 / 에러 / 데이터 분기 처리 */}
        {loading ? (
          <View style={styles.centerView}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>뉴스를 불러오는 중...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.centerView}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            {/* 데이터가 없을 때 파라미터 확인용 메시지 */}
            <Text style={styles.debugText}>code: {corpCode}, name: {corpName}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.wrapper}>
            {articles.length > 0 ? (
              <View style={newsStyles.companySection}>
                {articles.map((article, index) => (
                  <NewsArticleCard key={index} article={article} />
                ))}
              </View>
            ) : (
              <View style={newsStyles.noNewsText}>
                <Text style={{ color: "#8BA1C2", textAlign: "center", marginBottom: 10 }}>
                  '{corpName}'에 대한 최신 뉴스가 없습니다.
                </Text>
                <Text style={{ color: "#555", fontSize: 12, textAlign: "center" }}>
                  (API 응답에 해당 회사 데이터가 포함되지 않았습니다)
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};

export default mystockDetails;

// ------------------------------------
// 5. 스타일 정의
// ------------------------------------

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0b1220", // 배경색 직접 지정
  },
  wrapper: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  topNav: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 5,
  },
  headerContainer: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#E6EEF8",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8BA1C2",
    textAlign: "center",
    marginBottom: 10,
  },
  centerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#8BA1C2",
    fontSize: 14,
  },
  errorText: {
    color: "#f87171",
    fontSize: 16,
    fontWeight: "600",
    textAlign: 'center',
    marginBottom: 10,
  },
  debugText: {
    color: "#555",
    fontSize: 12,
  },
});

const newsStyles = StyleSheet.create({
  companySection: {
    marginBottom: 30,
  },
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#121b2e",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1e2a44",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  contentWrapper: {
    flex: 1,
    paddingRight: 12,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E6EEF8",
    lineHeight: 22,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: "#A3B3D1",
    marginTop: "auto",
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#1e2a44",
  },
  noNewsText: {
    fontSize: 14,
    color: "#8BA1C2",
    textAlign: "center",
    padding: 20,
    backgroundColor: "#121b2e",
    borderRadius: 10,
    marginTop: 20,
  },
});