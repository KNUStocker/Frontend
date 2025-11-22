import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

        <View style={{ width: 28 }} /> {/* 정렬용 empty space */}
      </View>

      {/* ⭐★ 핵심: ScrollView를 flex:1 wrapper로 감싸줘야 스크롤 정상 동작됨 ★⭐ */}
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 이미지 영역 */}
          <View style={styles.imageWrap}>
            {image ? (
              <Image source={{ uri: String(image) }} style={styles.image} />
            ) : (
              <View style={styles.emptyImage} />
            )}
          </View>

          {/* 회사명 + 날짜 */}
          <Text style={styles.metaText}>
            {company} • {date}
          </Text>

          {/* 제목 */}
          <Text style={styles.title}>{decodedTitle}</Text>

          {/* 본문 */}
          <Text style={styles.content}>{decodedContent}</Text>

          {/* 원문 링크 */}
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
    </View>
  );
}

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
    paddingBottom: 40,
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
    resizeMode: "cover",
  },

  emptyImage: {
    flex: 1,
  },

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
    marginTop: 10,
  },

  linkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
