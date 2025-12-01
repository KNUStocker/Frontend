import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// HTML 엔티티 디코더
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

export default function NewsDetailScreen() {
  const router = useRouter();

  const { title, content, date, company, image, link } =
    useLocalSearchParams<{
      title: string;
      content: string;
      date: string;
      company: string;
      image: string | null;
      link: string;
    }>();

  const decodedTitle = htmlDecode(title);
  const decodedContent = htmlDecode(content);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#E6EEF8" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>뉴스 상세</Text>

        <View style={{ width: 28 }} />
      </View>

      {/* 본문 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageWrap}>
          {image ? (
            <Image source={{ uri: String(image) }} style={styles.image} />
          ) : (
            <View style={styles.emptyImage} />
          )}
        </View>

        <Text style={styles.metaText}>
          {company} • {date}
        </Text>

        <Text style={styles.title}>{decodedTitle}</Text>

        <Text style={styles.content}>{decodedContent}</Text>

        {link && (
          <TouchableOpacity
            onPress={() => Linking.openURL(String(link))}
            style={styles.linkBtn}
          >
            <Text style={styles.linkText}>원문 확인하기</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

/* ======================= 스타일 ======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#1e2a44",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#E6EEF8",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  imageWrap: {
    width: "100%",
    height: 230,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1e2a44",
    marginBottom: 18,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  emptyImage: { flex: 1 },

  metaText: {
    color: "#8BA1C2",
    marginBottom: 8,
    fontSize: 13,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#E6EEF8",
    marginBottom: 16,
    lineHeight: 30,
  },

  content: {
    fontSize: 16,
    color: "#A3B3D1",
    lineHeight: 26,
    marginBottom: 30,
  },

  linkBtn: {
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    alignItems: "center",
  },

  linkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
