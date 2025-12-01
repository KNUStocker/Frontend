import { Ionicons } from "@expo/vector-icons";
import { useSegments } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    KeyboardEvent,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function FloatingSearch() {
  const segments = useSegments();
const last = segments[segments.length - 1];

/** 최초 화면(8081/) 대응 → last 가 undefined */
const isRoot = last === undefined;

/** 숨길 화면들 */
const HIDE_SCREENS = ["index", "mypage", "signup", "signin", "mystock"];

/** 최종 FAB 숨김 조건 */
const hideFab = isRoot || HIDE_SCREENS.includes(last);

  const [searchOpen, setSearchOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const keyboardOffset = useSharedValue(0);

  /** 키보드 높이 연동 */
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: KeyboardEvent) => {
        keyboardOffset.value = withTiming(e.endCoordinates.height, {
          duration: 200,
        });
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        keyboardOffset.value = withTiming(0, { duration: 200 });
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /** FAB 애니메이션 */
  const fabStyle = useAnimatedStyle(() => ({
    bottom: 30 + keyboardOffset.value,
  }));

  /** 검색창 애니메이션 */
  const searchBarStyle = useAnimatedStyle(() => ({
    bottom: 30 + keyboardOffset.value,
  }));

  /** API 요청 */
  const startSearch = async () => {
    if (!inputText.trim()) return;

    setSearchTerm(inputText.trim());
    setLoading(true);
    setSearchOpen(false);

    try {
      const response = await fetch(
        `https://backend-production-eb97.up.railway.app/api/description?term=${encodeURIComponent(
          inputText.trim()
        )}`,
        { headers: { Accept: "application/json" } }
      );

      const json = await response.json();
      setResult(json?.description ?? "결과 없음");
    } catch {
      setResult("오류가 발생했습니다.");
    }

    setLoading(false);
    setInputText("");
    Keyboard.dismiss();
  };

  /** 🔥 렌더링 단계에서 FAB 숨김 */
  if (hideFab) {
    return null;
  }

  return (
    <>
      {!searchOpen && (
        <Animated.View style={[styles.fabButton, fabStyle]}>
          <Pressable onPress={() => setSearchOpen(true)}>
            <Ionicons name="search" size={28} color="#fff" />
          </Pressable>
        </Animated.View>
      )}

      {searchOpen && (
        <Animated.View style={[styles.searchBar, searchBarStyle]}>
          <TextInput
            autoFocus
            value={inputText}
            onChangeText={setInputText}
            placeholder="모르는 용어를 입력하세요!"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.searchInput}
          />

          <Pressable onPress={startSearch} style={styles.sendBtn}>
            <Ionicons name="search" size={20} color="#fff" />
          </Pressable>

          <Pressable
            onPress={() => {
              setSearchOpen(false);
              setInputText("");
              Keyboard.dismiss();
            }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
        </Animated.View>
      )}

      {/* 로딩 모달 */}
      <Modal transparent visible={loading}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.loadingText}>분석 중...</Text>
        </View>
      </Modal>

      {/* 결과 모달 */}
      <Modal transparent visible={!!result} animationType="fade">
        <View style={styles.resultOverlay}>
          <View style={styles.resultBox}>
            <Pressable
              onPress={() => setResult(null)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={22} color="#333" />
            </Pressable>

            <Text style={styles.resultTitle}>{searchTerm}</Text>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabButton: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 30,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  searchBar: {
    position: "absolute",
    right: 20,
    width: SCREEN_WIDTH * 0.8,
    height: 58,
    backgroundColor: "#1f2b45",
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },

  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },

  sendBtn: { padding: 6 },
  closeBtn: { padding: 6 },

  loadingWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },

  resultOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  resultBox: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 14,
    padding: 22,
    position: "relative",
  },

  modalCloseBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 6,
  },

  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111",
  },

  resultText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#222",
  },
});
