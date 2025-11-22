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

const API_URL = "https://backend-production-eb97.up.railway.app/api/user/signup";

const SignupScreen: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username || !password) {
      Alert.alert("입력 오류", "아이디와 비밀번호를 입력해주세요.");
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
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();
      console.log("회원가입 응답:", data);

      if (!response.ok) {
        Alert.alert("회원가입 실패", data.message || "정보를 다시 확인해주세요.");
        setLoading(false);
        return;
      }

      Alert.alert("완료", "회원가입이 완료되었습니다. 로그인해주세요!");
      router.replace("/");

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
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>계정을 생성하고 Stock Guardian을 이용해보세요</Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="아이디"
              placeholderTextColor="#7E889C"
              autoCapitalize="none"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
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
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.loginText}>
              {loading ? "회원가입 중..." : "회원가입"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>이미 계정이 있나요?</Text>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={styles.footerLink}> 로그인</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignupScreen;

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
