import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

// 📌 JSON 데이터 불러오기
// (경로 확인: '../../assets/data/corp_list.json')
import STOCK_DATA_RAW from '../../assets/data/corp_list.json';

// 타입 단언
const STOCK_LIST = STOCK_DATA_RAW as { 종목코드: string; 종목명: string }[];
const API_URL = "https://backend-production-eb97.up.railway.app/user/favorites";

/* ======================================================
   🔥 [메타 데이터] 로고 & 카테고리 매핑 정보
   (이 리스트에 있는 종목을 직접 담으면 로고/카테고리가 자동 적용됩니다)
   ====================================================== */
const STOCK_META_DATA: Record<string, { domain: string; category: string }> = {
  // 데모 시연용 주요 종목들
  "삼성전자": { domain: "samsung.com", category: "반도체/IT" },
  "SK하이닉스": { domain: "skhynix.com", category: "반도체/IT" },
  "NAVER": { domain: "naver.com", category: "플랫폼" },
  "카카오": { domain: "kakaocorp.com", category: "플랫폼" },
  "현대차": { domain: "hyundai.com", category: "자동차" },
  "기아": { domain: "kia.com", category: "자동차" },
  "LG에너지솔루션": { domain: "lgensol.com", category: "2차전지" },
  "POSCO홀딩스": { domain: "posco.co.kr", category: "철강/소재" },
  "KB금융": { domain: "kbfg.com", category: "금융" },
  "셀트리온": { domain: "celltrion.com", category: "바이오" },
  "LG전자": { domain: "lge.com", category: "가전/IT" },
  "LG화학": { domain: "lgchem.com", category: "화학/에너지" },
};

/* ======================================================
   Helper: 메타 데이터 적용 함수
   ====================================================== */
const applyMeta = (item: any) => {
  const meta = STOCK_META_DATA[item.corp_name];
  if (meta) {
    return {
      ...item,
      category: meta.category,
      domains: [meta.domain], // 로고 도메인 강제 적용
      emoji: null, // 이모지 대신 로고 사용
    };
  }
  // 메타데이터가 없으면 기본값 유지
  return item;
};

/* ======================================================
   영어 문자열의 모든 대소문자 조합 생성 함수
   ====================================================== */
function generateAllCaseVariants(str: string) {
  const result: string[] = [];
  function dfs(index: number, current: string) {
    if (index === str.length) {
      result.push(current);
      return;
    }
    const char = str[index];
    if (/[a-zA-Z]/.test(char)) {
      dfs(index + 1, current + char.toLowerCase());
      dfs(index + 1, current + char.toUpperCase());
    } else {
      dfs(index + 1, current + char);
    }
  }
  dfs(0, "");
  return result;
}

export default function AddFavoriteScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [userToken, setUserToken] = useState<string | null>(null);
  
  // 🔍 자동완성 관련 상태
  const [suggestions, setSuggestions] = useState<typeof STOCK_LIST>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const router = useRouter();

  // === 임시 종목코드 생성 ===
  const generateCode = (name: string) => {
    return (
      name
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0)
        .toString() + "0"
    ).slice(0, 6);
  };

  /* ======================================================
      📌 1) 최초 로드 시 토큰 확인 & 관심종목 불러오기
      ====================================================== */
  useEffect(() => {
    const initPage = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          Alert.alert("알림", "로그인이 필요한 서비스입니다.");
          router.replace("/");
          return;
        }
        setUserToken(token);
        fetchFavorites(token);
      } catch (e) {
        console.error("토큰 로드 실패:", e);
      }
    };
    initPage();
  }, []);

  const fetchFavorites = async (token: string) => {
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: { token },
      });

      if (res.status === 401 || res.status === 403) {
        Alert.alert("세션 만료", "다시 로그인해주세요.");
        router.replace("/");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        // 서버에서 받아온 데이터에 메타 정보(로고/카테고리) 입히기
        const mappedData = data.map((item: any) => ({
          corp_code: item.corp_code,
          corp_name: item.corp_name,
          emoji: "⭐",
          category: "기타",
          domains: [],
        })).map(applyMeta);

        setFavorites(mappedData);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("오류", "서버 연결 실패");
    }
  };

  /* ======================================================
      🔍 검색어 입력 핸들러 (자동완성)
      ====================================================== */
  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!text.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lowerText = text.toLowerCase();
    
    // JSON 리스트에서 검색
    const filtered = STOCK_LIST.filter((item) => 
      item.종목명.toLowerCase().includes(lowerText)
    );

    // 정렬: 검색어로 시작하는 종목 우선
    filtered.sort((a, b) => {
      const aStarts = a.종목명.toLowerCase().startsWith(lowerText);
      const bStarts = b.종목명.toLowerCase().startsWith(lowerText);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

    setSuggestions(filtered.slice(0, 30));
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (item: { 종목명: string; 종목코드: string }) => {
    setInputText(item.종목명);
    setSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  /* ======================================================
      📌 2) 관심종목 담기
      ====================================================== */
  const onSubmit = async () => {
    const name = inputText.trim();
    if (!name) {
      Alert.alert("입력 오류", "종목명을 입력해주세요.");
      return;
    }
    if (!userToken) {
      Alert.alert("오류", "로그인 정보가 없습니다.");
      return;
    }

    setShowSuggestions(false);

    // 대소문자 조합 생성
    const variants = generateAllCaseVariants(name);
    let finalName = null;
    let finalCode = null;

    // 실제 전송
    for (const v of variants) {
      // 리스트에 있는 종목이면 그 코드를 사용 (우선순위)
      const foundItem = STOCK_LIST.find(i => i.종목명 === v);
      const corp_code = foundItem ? foundItem.종목코드 : generateCode(v);

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: userToken,
          },
          body: JSON.stringify({
            corp_code,
            corp_name: v,
          }),
        });

        if (response.ok) {
          finalName = v;
          finalCode = corp_code;
          break;
        }
      } catch (err) {
        console.log("POST 실패:", v, err);
      }
    }

    if (!finalName) {
      Alert.alert("오류", "해당 종목을 담을 수 없습니다.");
      return;
    }

    // 🔥 추가된 항목에도 메타 데이터(사진/카테고리) 적용
    const newItemRaw = {
      corp_code: finalCode,
      corp_name: finalName,
      emoji: "⭐",
      category: "기타",
      domains: [],
    };
    
    // 여기서 applyMeta를 호출하므로 추가하는 즉시 사진/카테고리가 적용됨
    const newItem = applyMeta(newItemRaw);

    setFavorites((prev) => [...prev, newItem]);
    setInputText("");
    Keyboard.dismiss();
    Alert.alert("완료", `${finalName} 담기 완료!`);
  };

  /* ======================================================
      📌 3) 종목 삭제
      ====================================================== */
  const removeFavorite = async (corp_name: string) => {
    // 1. 화면에서 즉시 삭제
    setFavorites((prev) => prev.filter((f) => f.corp_name !== corp_name));

    if (!userToken) return;

    // 2. 서버 요청
    try {
      await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          token: userToken,
        },
        body: JSON.stringify({ corp_name }),
      });
    } catch (err) {
      console.error("DELETE 오류:", err);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowSuggestions(false)}>
      <View style={styles.container}>
        
        {/* 검색창 & 자동완성 영역 */}
        <View style={styles.searchSectionZIndex}>
            <View style={styles.headerBox}>
            <TextInput
                value={inputText}
                onChangeText={handleInputChange}
                placeholder="종목명을 입력하세요 (예: 삼성전자)"
                placeholderTextColor="#7E889C"
                style={styles.input}
                onFocus={() => {
                    if(inputText) setShowSuggestions(true);
                }}
            />
            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                <Text style={styles.submitText}>담기</Text>
            </TouchableOpacity>
            </View>

            {/* 자동완성 팝업 */}
            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionBox}>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.종목코드}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.suggestionItem}
                                onPress={() => handleSelectSuggestion(item)}
                            >
                                <Text style={styles.suggestionText}>{item.종목명}</Text>
                            </TouchableOpacity>
                        )}
                        style={{ maxHeight: 220 }}
                    />
                </View>
            )}
        </View>

        <Text style={styles.subTitle}>담긴 종목</Text>

        <FlatList
          data={favorites}
          keyExtractor={(item) => item.corp_code}
          contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
          onScrollBeginDrag={Keyboard.dismiss} 
          renderItem={({ item }) => (
            <StockCard
              item={item}
              onDelete={() => removeFavorite(item.corp_name)}
            />
          )}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

/* ===========================================================
   StockCard Component
   =========================================================== */
function StockCard({ item, onDelete }: { item: any; onDelete: () => void }) {
  const [fail, setFail] = useState(false);
  const router = useRouter();

  const domain = item.domains?.[0];
  const uri = domain ? `https://logo.clearbit.com/${domain}` : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/mystockDetails",
          params: {
            corp_code: item.corp_code,
            corp_name: item.corp_name,
          },
        })
      }
    >
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          {!fail && uri ? (
            <Image
              source={{ uri }}
              style={styles.logo}
              resizeMode="contain"
              onError={() => setFail(true)}
            />
          ) : (
            <Text style={styles.icon}>{item.emoji}</Text>
          )}
        </View>

        <View>
          <Text style={styles.name}>{item.corp_name}</Text>
          <Text style={styles.category}>{item.category}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Text style={{ color: "#f87171", fontWeight: "700" }}>삭제</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

/* ======================= Styles ======================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F1320" },

  searchSectionZIndex: {
    zIndex: 10,
    elevation: 10,
  },

  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: "#191E2C",
    borderRadius: 14,
    padding: 10,
    gap: 10,
    zIndex: 1,
  },

  input: {
    flex: 1,
    color: "#E9EDF5",
    fontSize: 15,
    paddingLeft: 10,
  },

  submitButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  submitText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  suggestionBox: {
    position: "absolute",
    top: 75,
    left: 16,
    right: 16,
    backgroundColor: "#252A38",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3b4050",
    zIndex: 20,
    elevation: 20,
    overflow: "hidden",
  },
  suggestionItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#333845",
  },
  suggestionText: {
    color: "#E9EDF5",
    fontSize: 15,
    fontWeight: "500",
  },

  subTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E9EDF5",
    paddingHorizontal: 16,
    marginTop: 20,
    zIndex: -1,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#191E2C",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    justifyContent: "space-between",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2A2E3A",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: { width: 36, height: 36 },

  icon: { fontSize: 24 },

  name: { fontSize: 16, fontWeight: "700", color: "#E9EDF5" },
  category: { fontSize: 13, color: "#8B93A7", marginTop: 2 },

  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f87171",
  },
});