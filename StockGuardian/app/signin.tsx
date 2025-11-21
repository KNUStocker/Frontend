import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    router.push("/(tabs)/homepage");
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

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>로그인</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>계정이 없나요?</Text>
            <TouchableOpacity>
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
