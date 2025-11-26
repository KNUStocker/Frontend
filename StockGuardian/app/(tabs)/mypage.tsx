import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
} from "react-native";

// API 엔드포인트 정의
const LOGOUT_API_URL = "https://backend-production-eb97.up.railway.app/api/user/logout";
const PROFILE_UPDATE_API_URL = "https://backend-production-eb97.up.railway.app/api/user/profile";

interface UserProfile {
  name: string;
  email: string;
  memberSince: string;
  profileImage: string;
  nickname: string;
}

// ------------------------------------
// 1. 프로필 수정 모달 컴포넌트 (외부로 분리)
// ------------------------------------
interface EditModalProps {
  isVisible: boolean;
  isLoading: boolean;
  currentNickname: string;
  existingPasswordValue: string;
  onClose: () => void;
  onNicknameChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onSave: () => Promise<void>;
}

const EditProfileModal: React.FC<EditModalProps> = ({
  isVisible,
  isLoading,
  currentNickname,
  existingPasswordValue,
  onClose,
  onNicknameChange,
  onPasswordChange,
  onSave,
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={isVisible}
    onRequestClose={onClose}
  >
    <View style={modalStyles.centeredView}>
      <View style={modalStyles.modalView}>
        <Text style={modalStyles.modalTitle}>회원 정보 수정</Text>
        <Text style={modalStyles.modalSubtitle}>닉네임 수정을 위해 기존 비밀번호를 입력해주세요.</Text>

        <TextInput
          style={modalStyles.input}
          placeholder="새 닉네임"
          placeholderTextColor="#7E889C"
          value={currentNickname}
          onChangeText={onNicknameChange}
        />
        <TextInput
          style={modalStyles.input}
          placeholder="기존 비밀번호 확인"
          placeholderTextColor="#7E889C"
          secureTextEntry
          value={existingPasswordValue}
          onChangeText={onPasswordChange}
        />

        <View style={modalStyles.buttonContainer}>
          <TouchableOpacity
            style={[modalStyles.button, modalStyles.cancelButton]}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={modalStyles.textStyle}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[modalStyles.button, isLoading && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={isLoading}
          >
            <Text style={modalStyles.textStyle}>
              {isLoading ? "수정 중..." : "수정 완료"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);


const MyPageScreen: React.FC = () => {
  const router = useRouter();
  
  // ------------------------------------
  // 사용자 상태 및 로딩 상태 관리
  // ------------------------------------
  const [user, setUser] = useState<UserProfile>({
    name: "홍길동",
    email: "hong@example.com",
    memberSince: "2025-11-02",
    profileImage: "https://i.pravatar.cc/150?img=3",
    nickname: "gildong_hong",
  });

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // 수정 필드 상태
  const [newNickname, setNewNickname] = useState(user.nickname);
  const [existingPassword, setExistingPassword] = useState(""); 


  // ------------------------------------
  // 2. 프로필 수정 핸들러
  // ------------------------------------

  const handleEditProfile = () => {
    // 모달을 열기 전에 상태를 현재 값으로 초기화
    setNewNickname(user.nickname);
    setExistingPassword("");
    setIsModalVisible(true);
  };
  
  const handleUpdateProfile = async () => {
    const trimmedNickname = newNickname.trim();

    if (!trimmedNickname || !existingPassword) {
      Alert.alert("입력 오류", "닉네임과 기존 비밀번호를 모두 입력해 주세요.");
      return;
    }
    
    setEditLoading(true);

    try {
      // 닉네임과 기존 비밀번호를 함께 전송
      const response = await fetch(PROFILE_UPDATE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: trimmedNickname,
          password: existingPassword, // 기존 비밀번호로 인증
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        Alert.alert("수정 실패", data.message || "회원 정보 수정에 실패했습니다. 비밀번호를 확인해주세요.");
        return;
      }
      
      // 성공 처리: 클라이언트 상태에 닉네임 업데이트
      setUser(prev => ({ ...prev, nickname: trimmedNickname }));
      
      Alert.alert("수정 완료", "닉네임이 성공적으로 업데이트되었습니다.");
      setIsModalVisible(false); // 모달 닫기
      
    } catch (error) {
      Alert.alert("연결 오류", "서버와 연결할 수 없습니다.");
      console.error(error);
    } finally {
      setEditLoading(false);
    }
  };

  // ------------------------------------
  // 3. 로그아웃 핸들러
  // ------------------------------------

  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      const response = await fetch(LOGOUT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("서버 로그아웃 실패:", data);
        Alert.alert("로그아웃 오류", "서버 세션 종료에 실패했습니다. 다시 시도해 주세요.");
      } else {
        console.log("로그아웃 성공: 서버 세션 종료 완료");
      }
      
      // 클라이언트 리디렉션 
      Alert.alert("로그아웃 완료", "성공적으로 로그아웃되었습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/"), // 로그인 화면 경로로 이동
        },
      ]);
      
    } catch (error) {
      Alert.alert("연결 오류", "서버와 연결할 수 없습니다.");
      console.error(error);
      router.replace("/"); 
    } finally {
      setLogoutLoading(false);
    }
  };


  // ------------------------------------
  // 4. 메인 렌더링
  // ------------------------------------
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
            
            <Text style={styles.label}>닉네임</Text>
            <Text style={styles.value}>{user.nickname}</Text>

            <Text style={styles.label}>이메일</Text>
            <Text style={styles.value}>{user.email}</Text>

            <Text style={styles.label}>가입일</Text>
            <Text style={styles.value}>{user.memberSince}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
            <Text style={styles.buttonText}>회원 정보 수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton, logoutLoading && { opacity: 0.6 }]}
            onPress={handleLogout}
            disabled={logoutLoading}
          >
            <Text style={styles.buttonText}>
              {logoutLoading ? "로그아웃 중..." : "로그아웃"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      {/* 분리된 모달 컴포넌트를 호출하고 props 전달 */}
      <EditProfileModal 
        isVisible={isModalVisible}
        isLoading={editLoading}
        currentNickname={newNickname}
        existingPasswordValue={existingPassword}
        onClose={() => setIsModalVisible(false)}
        onNicknameChange={setNewNickname}
        onPasswordChange={setExistingPassword}
        onSave={handleUpdateProfile}
      />
    </LinearGradient>
  );
};

export default MyPageScreen;

// ------------------------------------
// 스타일 정의 (이 부분은 변경 없음)
// ------------------------------------

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

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)", // 반투명 배경
  },
  modalView: {
    margin: 20,
    backgroundColor: "#0b1220",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
    borderWidth: 1,
    borderColor: "#1e2a44",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E6EEF8",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#8BA1C2",
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: "100%",
    backgroundColor: "#121b2e",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    fontSize: 16,
    color: "#E6EEF8",
    borderWidth: 1,
    borderColor: "#1e2a44",
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  button: {
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#3b82f6",
  },
  cancelButton: {
    backgroundColor: "#7E889C",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});