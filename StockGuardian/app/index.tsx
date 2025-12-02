import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "https://backend-production-eb97.up.railway.app/api/user/login";

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const goSignup = () => {
    router.push("/signup");
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("로그인 실패", data.message || "아이디 또는 비밀번호를 확인해주세요.");
        setLoading(false);
        return;
      }

      console.log("로그인 성공:", data);

      // ==========================================
      // 🔥 [수정됨] 토큰 저장 로직 추가
      // ==========================================
      if (data.token) {
        // 서버에서 준 토큰을 'userToken'이라는 이름으로 폰에 저장
        await AsyncStorage.setItem('userToken', data.token);
        console.log("토큰 저장 완료:", data.token);
      } else {
        console.log("경고: 서버 응답에 토큰이 없습니다.");
      }

      // 저장 후 페이지 이동
      router.push("/(tabs)/homepage");
      
    } catch (error) {
      Alert.alert("오류", "서버와 연결할 수 없습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0b1220", "#111a2e", "#0b1220"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.wrapper}
        >
          <Text style={styles.title}>Stock Guardian</Text>
          <Text style={styles.subtitle}>로그인하고 서비스를 이용해보세요</Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="이메일"
              placeholderTextColor="#7E889C"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              placeholder="비밀번호"
              placeholderTextColor="#7E889C"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginText}>
              {loading ? "로그인 중..." : "로그인"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>계정이 없나요?</Text>
            <TouchableOpacity onPress={goSignup}>
              <Text style={styles.footerLink}> 회원가입</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#E6EEF8",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#8BA1C2",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: { gap: 16, marginBottom: 28 },
  input: {
    backgroundColor: "#121b2e",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    fontSize: 16,
    color: "#E6EEF8",
    borderWidth: 1,
    borderColor: "#1e2a44",
  },
  loginButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  loginText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: { color: "#A3B3D1", fontSize: 14 },
  footerLink: { color: "#3b82f6", fontWeight: "700" },
});