import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger } from "react-native-popup-menu";

// -------------------- 뉴스 데이터 --------------------
const FEED_DATA = [
  {
    id: "1",
    title: "SK하이닉스, 3분기 실적 호조…매출 전년 대비 12% 증가",
    caption: "SK하이닉스의 3분기 실적이 시장 예상치를 상회하며 투자자들의 관심이 집중되고 있습니다.",
    user: "반도체_뉴스",
    timestamp: "2시간 전",
    imageUri: "https://placehold.co/80x80/1e2a44/A3B3D1?text=SK",
  },
  {
    id: "2",
    title: "SK하이닉스, 차세대 DRAM 개발 성공",
    caption: "SK하이닉스가 업계 최초로 새로운 DRAM 기술을 상용화하며 기술 경쟁력을 강화했습니다.",
    user: "테크_뉴스",
    timestamp: "6시간 전",
    imageUri: "https://placehold.co/80x80/2f446e/C9D7F1?text=DRAM",
  },
  {
    id: "3",
    title: "SK하이닉스, 글로벌 반도체 시장 점유율 확대",
    caption: "SK하이닉스가 글로벌 메모리 시장에서 점유율을 확대하며 안정적인 성장세를 보여주고 있습니다.",
    user: "주식_파수꾼",
    timestamp: "1일 전",
    imageUri: "https://placehold.co/80x80/3e4a6e/C9D7F1?text=Market",
  },
  {
    id: "4",
    title: "SK하이닉스, AI 반도체 투자 계획 발표",
    caption: "인공지능 시장 공략을 위해 SK하이닉스가 AI 전용 반도체 개발에 투자할 계획을 밝혔습니다.",
    user: "IT_뉴스",
    timestamp: "3일 전",
    imageUri: "https://placehold.co/80x80/4f5a7e/A3B3D1?text=AI",
  },
  {
    id: "5",
    title: "SK하이닉스, ESG 경영 강화…친환경 전략 발표",
    caption: "SK하이닉스가 친환경 생산과 지속 가능한 경영을 위해 ESG 전략을 강화한다고 발표했습니다.",
    user: "환경_투자",
    timestamp: "5일 전",
    imageUri: "https://placehold.co/80x80/5f6a8e/C9D7F1?text=ESG",
  },
  {
    id: "6",
    title: "SK하이닉스, 차세대 NAND 플래시 공개",
    caption: "차세대 NAND 플래시 메모리 출시로 데이터 저장 장치 시장 경쟁력이 강화되었습니다.",
    user: "반도체_연구",
    timestamp: "6시간 전",
    imageUri: "https://placehold.co/80x80/6f7a9e/A3B3D1?text=NAND",
  },
  {
    id: "7",
    title: "SK하이닉스, 신규 공장 건설 계획 발표",
    caption: "SK하이닉스가 국내 신규 반도체 생산 공장 건설을 통해 글로벌 생산 능력을 확대합니다.",
    user: "경제_뉴스",
    timestamp: "2일 전",
    imageUri: "https://placehold.co/80x80/7f8aae/C9D7F1?text=Factory",
  },
  {
    id: "8",
    title: "SK하이닉스, 반도체 장비 업계와 협력 강화",
    caption: "차세대 메모리 생산을 위해 SK하이닉스가 반도체 장비 업체와 전략적 파트너십을 체결했습니다.",
    user: "산업_뉴스",
    timestamp: "4일 전",
    imageUri: "https://placehold.co/80x80/8f9abe/A3B3D1?text=Equip",
  },
];

// -------------------- 화면 --------------------
export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredArticles = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return FEED_DATA;
    return FEED_DATA.filter(
      (a) => a.title.toLowerCase().includes(q) || a.caption.toLowerCase().includes(q)
    );
  }, [query]);

  const pieData = [
    { name: "Income", amount: 2000, color: "#10b981", legendFontColor: "#E6EEF8", legendFontSize: 14 },
    { name: "Expense", amount: 4000, color: "#ef4444", legendFontColor: "#E6EEF8", legendFontSize: 14 },
  ];

  const handleMenuPress = (item: typeof FEED_DATA[0]) => {
    Alert.alert("설명보기", item.caption);
  };

  return (
    <MenuProvider>
      <LinearGradient colors={["#0b1220", "#111a2e", "#0b1220"]} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          {/* ----------------- 헤더 ----------------- */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/(tabs)/mystock")}
            >
              <Ionicons name="arrow-back" size={28} color="#E6EEF8" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>SK 하이닉스</Text>
            <View style={{ width: 40 }} /> {/* 오른쪽 빈 공간 */}
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
              width={Dimensions.get("window").width - 32} // 반응형
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

          {/* ----------------- AI 분석 ----------------- */}
          <Text style={styles.analysisTitle}>SK 하이닉스 분석</Text>
          <View style={styles.analysisBox}>
            <Text style={styles.analysisText}>
              SK하이닉스는 최근 분기 실적이 시장 예상치를 상회하며 실적 회복세를 보이고 있습니다.{"\n"}
              차세대 DRAM과 AI 반도체 개발을 통해 기술 경쟁력을 강화하고 있으며,{"\n"}
              글로벌 메모리 시장 점유율 또한 꾸준히 확대 중입니다.{"\n"}
              ESG 경영 강화로 장기적인 안정성도 높아지고 있어{"\n"}
              📊 현재는 투자하기에 긍정적인 시점으로 판단됩니다.
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
          <FlatList
            data={filteredArticles}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) =>
              item.title.includes("DRAM") ? (
                <Menu>
                  <MenuTrigger>
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
                  </MenuTrigger>
                  <MenuOptions>
                    <MenuOption onSelect={() => handleMenuPress(item)} text="설명보기" />
                  </MenuOptions>
                </Menu>
              ) : (
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
              )
            }
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.emptyText}>검색 결과가 없어요.</Text>}
          />
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
