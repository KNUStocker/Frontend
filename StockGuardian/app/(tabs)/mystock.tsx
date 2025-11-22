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
  View,
} from "react-native";

const API_URL = "https://backend-production-eb97.up.railway.app/user/favorites";
const TEMP_TOKEN = "cheerhow";

export default function AddFavoriteScreen() {
  const [favorites, setFavorites] = useState([]);
  const [inputText, setInputText] = useState("");

  // === 임시 종목코드 생성 ===
  const generateCode = (name: string) => {
    return (
      name
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0)
        .toString() + "0"
    ).slice(0, 6);
  };

  // ============================
  // 📌 1) 페이지 들어오면 GET 실행
  // ============================
  const fetchFavorites = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          token: TEMP_TOKEN,
        },
      });

      if (!res.ok) {
        Alert.alert("오류", "관심종목 불러오기에 실패했습니다.");
        return;
      }

      const data = await res.json();
      // 서버에서 내려주는 형식에 맞게 매핑 (emoji/domain 임시 생성)
      const mapped = data.map((item: any) => ({
        corp_code: item.corp_code,
        corp_name: item.corp_name,
        emoji: "⭐",
        category: "기타",
        domains: [],
      }));

      setFavorites(mapped);
    } catch (err) {
      console.error(err);
      Alert.alert("오류", "서버 연결 실패");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // ======================================================
  // 📌 2) 관심종목 담기 (POST)
  // ======================================================
  const onSubmit = async () => {
    const name = inputText.trim();
    if (!name) {
      Alert.alert("입력 오류", "종목명을 입력해주세요.");
      return;
    }

    const corp_code = generateCode(name);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: TEMP_TOKEN,
        },
        body: JSON.stringify({
          corp_code,
          corp_name: name,
        }),
      });

      if (!response.ok) {
        Alert.alert("실패", "관심 종목 담기 실패");
        return;
      }

      if (!favorites.find((f) => f.corp_code === corp_code)) {
        setFavorites((prev) => [
          ...prev,
          {
            corp_code,
            corp_name: name,
            emoji: "⭐",
            category: "기타",
            domains: [],
          },
        ]);
      }

      setInputText("");
      Keyboard.dismiss();
      Alert.alert("완료", `${name} 담기 완료!`);
    } catch (e) {
      Alert.alert("오류", "서버와 연결할 수 없습니다.");
      console.error(e);
    }
  };

  // ======================================================
  // 📌 3) 삭제 (서버 DELETE 스펙 나오면 연결, 지금은 로컬 제거)
  // ======================================================
  const removeFavorite = (corp_code: string) => {
    setFavorites((prev) => prev.filter((f) => f.corp_code !== corp_code));
  };

  return (
    <View style={styles.container}>
      {/* === 상단 검색 + 담기 Box === */}
      <View style={styles.headerBox}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="종목명을 입력하세요"
          placeholderTextColor="#7E889C"
          style={styles.input}
        />

        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitText}>담기</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>담긴 종목</Text>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.corp_code}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <StockCard
            item={item}
            onDelete={() => removeFavorite(item.corp_code)}
          />
        )}
      />
    </View>
  );
}

// ============ Stock Card Component ============
function StockCard({ item, onDelete }: any) {
  const [fail, setFail] = useState(false);

  const domain = item.domains?.[0];
  const uri = domain ? `https://logo.clearbit.com/${domain}` : null;

  return (
    <View style={styles.card}>
      {/* Left area */}
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

      {/* 삭제 버튼 */}
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Text style={{ color: "#f87171", fontWeight: "700" }}>삭제</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ======================= Styles ======================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F1320" },

  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: "#191E2C",
    borderRadius: 14,
    padding: 10,
    gap: 10,
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

  subTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E9EDF5",
    paddingHorizontal: 16,
    marginTop: 20,
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

  left: { flexDirection: "row", alignItems: "center", gap: 14 },

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
