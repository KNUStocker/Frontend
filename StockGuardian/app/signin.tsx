import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, StatusBar, View, Button } from 'react-native';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { State } from 'react-native-gesture-handler';

export default function signin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    router.replace('/(tabs)/explore');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('로그인 실패', '올바른 이메일을 입력하세요.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('로그인 실패', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 600));
      Alert.alert('로그인 성공', `${email}님 환영합니다!`);
      // router.replace('/home');
    } finally {
      setLoading(false);
    }
  };

  // 안드로이드에서 키보드 오프셋(상태바 + 안전영역 고려)
  const androidOffset = (StatusBar.currentHeight ?? 0) + insets.top;

  return (
    <Safe style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top }}>
      <SafeText>회원가입 페이지!</SafeText>
      <Login
      title={'로그인'}
    onPress={onLogin}
  disabled={loading}></Login>
    </Safe>
  );
}

/* ===== styled-components ===== */
const Safe = styled.SafeAreaView`
  flex: 1;
  background-color: #0b1220;
  align-item: center;
`;

const SafeText = styled.Text`
    color: white;
    font-size: 10rem;
`

const Login = styled.Button`
    
`
