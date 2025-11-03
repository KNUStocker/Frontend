import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MyPageScreen: React.FC = () => {
  const user = {
    name: "홍길동",
    email: "hong@example.com",
    memberSince: "2025-11-02",
    profileImage: "https://i.pravatar.cc/150?img=3",
  };

  const handleEditProfile = () => alert("회원 정보 수정 클릭!");
  const handleLogout = () => alert("로그아웃!");

  return (
    <LinearGradient
      colors={["#0b1220", "#111a2e", "#0b1220"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.wrapper}>
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />

          <View style={styles.infoCard}>
            <Text style={styles.label}>이름</Text>
            <Text style={styles.value}>{user.name}</Text>

            <Text style={styles.label}>이메일</Text>
            <Text style={styles.value}>{user.email}</Text>

            <Text style={styles.label}>가입일</Text>
            <Text style={styles.value}>{user.memberSince}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
            <Text style={styles.buttonText}>회원 정보 수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>로그아웃</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default MyPageScreen;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  wrapper: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#121b2e",
    padding: 20,
    borderRadius: 14,
    marginBottom: 24,
  },
  label: { fontSize: 12, color: "#8BA1C2", marginTop: 8 },
  value: {
    fontSize: 16,
    color: "#E6EEF8",
    fontWeight: "600",
    marginTop: 2,
  },
  button: {
    width: "100%",
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  logoutButton: { backgroundColor: "#ef4444" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
