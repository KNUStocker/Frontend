import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSegments } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface ChatMessage {
  role: "user" | "bot";
  title?: string;
  content: string;
  created_at?: string;
}

export default function FloatingSearch() {
  const segments = useSegments();
  const last = segments[segments.length - 1];
  const isRoot = last === undefined;
  const HIDE_SCREENS = ["index", "mypage", "signup", "signin", "mystock"];
  const hideFab = isRoot || HIDE_SCREENS.includes(last);

  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingReply, setLoadingReply] = useState(false);

  const listRef = useRef<FlatList>(null);
  const panelY = useSharedValue(SCREEN_HEIGHT);

  const panelStyle = useAnimatedStyle(() => ({
    top: panelY.value,
  }));

  const extractTerm = (content: string, fallback: string) => {
    const inQuote = content.match(/'([^']+)'/);
    if (inQuote) return inQuote[1];
    const first = content.split(" ")[0]?.replace(/[^가-힣A-Za-z0-9]/g, "");
    return first || fallback;
  };

  const openPanel = async () => {
    setOpen(true);
    panelY.value = withTiming(SCREEN_HEIGHT * 0.35, { duration: 250 });

    const token = await AsyncStorage.getItem("userToken");
    if (token) loadHistory(token);
  };

  const closePanel = () => {
    panelY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
    setTimeout(() => setOpen(false), 250);
  };

  const loadHistory = async (token: string) => {
    try {
      const res = await fetch(
        "https://backend-production-eb97.up.railway.app/api/description/history",
        { headers: { token } }
      );

      const json = await res.json();

      if (json?.history) {
        const formatted = json.history.map((item: any) => {
          if (item.role === "bot") {
            const title = extractTerm(item.content, "");
            return {
              role: "bot",
              title,
              content: item.content,
              created_at: item.created_at,
            };
          } else {
            return {
              role: "user",
              content: item.content,
              created_at: item.created_at,
            };
          }
        });

        setMessages(formatted);
        scrollToBottom();
      }
    } catch (err) {
      console.warn("history error", err);
    }
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;

    setInputText("");

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();
    setLoadingReply(true);

    try {
      const token = await AsyncStorage.getItem("userToken");

      const res = await fetch(
        "https://backend-production-eb97.up.railway.app/api/description",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            token: token ?? "",
          },
          body: JSON.stringify({ term: text }),
        }
      );

      const json = await res.json();

      const extracted = extractTerm(json?.description ?? "", text);

      const botMsg: ChatMessage = {
        role: "bot",
        title: extracted,
        content: json?.content ?? "결과 없음",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", title: text, content: "오류가 발생했습니다." },
      ]);
    }

    setLoadingReply(false);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <>
      {!hideFab && (
        <>
          {!open && (
            <Pressable style={styles.fab} onPress={openPanel}>
              <Ionicons name="search" size={28} color="#fff" />
            </Pressable>
          )}

          {open && (
            <Animated.View style={[styles.panelWrap, panelStyle]}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>AI 용어 설명</Text>
                <Pressable onPress={closePanel}>
                  <Ionicons name="close" size={24} color="#E6EEF8" />
                </Pressable>
              </View>

              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(_, i) => i.toString()}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.chatBubble,
                      item.role === "user" ? styles.userBubble : styles.botBubble,
                    ]}
                  >
                    {item.role === "bot" ? (
                      <View>
                        {item.title ? (
                          <Text style={styles.botTitle}>{item.title}</Text>
                        ) : null}
                        <Text style={styles.botBubbleText}>{item.content}</Text>
                      </View>
                    ) : (
                      <Text style={styles.userBubbleText}>{item.content}</Text>
                    )}
                  </View>
                )}
              />

              {loadingReply && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#A3B3D1" size="small" />
                  <Text style={styles.loadingMsg}>답변 생성 중...</Text>
                </View>
              )}

              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
              >
                <View style={styles.inputRow}>
                  <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="모르는 용어를 입력하세요!"
                    placeholderTextColor="#7E889C"
                    style={styles.input}
                  />
                  <Pressable style={styles.sendBtn} onPress={sendMessage}>
                    <Ionicons name="send" size={20} color="#fff" />
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
            </Animated.View>
          )}
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 60,
    right: 22,
    width: 58,
    height: 58,
    backgroundColor: "#3b82f6",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  panelWrap: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.6,
    right: 0,
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: "#07080aff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#1e2a44",
  },

  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#1e2a44",
  },

  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E6EEF8",
  },

  chatBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },

  userBubble: {
    backgroundColor: "#3b82f6",
    alignSelf: "flex-end",
    borderTopRightRadius: 0,
  },

  botBubble: {
    backgroundColor: "#1f2b45",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
  },

  userBubbleText: { color: "#fff" },

  botTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E6EEF8",
    marginBottom: 6,
  },

  botBubbleText: {
    color: "#E6EEF8",
    fontSize: 14,
    lineHeight: 20,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    marginBottom: 6,
  },

  loadingMsg: {
    marginLeft: 8,
    color: "#A3B3D1",
    fontSize: 13,
  },

  inputRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#1e2a44",
    backgroundColor: "#121b2e",
  },

  input: {
    flex: 1,
    color: "#E6EEF8",
    fontSize: 15,
    backgroundColor: "#0b1220",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
