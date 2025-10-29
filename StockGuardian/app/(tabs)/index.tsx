import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, StatusBar, View } from 'react-native';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    router.replace('../signin');
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: androidOffset })}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Container>
            {/* 헤더 */}
            <Header>
              <Brand>Welcome!</Brand>
              <Title>Stock Guardian</Title>
              <Subtitle>계정에 로그인해 계속 진행하세요</Subtitle>
            </Header>

            {/* 폼 */}
            <Form>
              <Label>
                <Ionicons name="person" size={16} color="#C9D7F1" />  아이디
              </Label>
              <StyledInput
                placeholder="username or email"
                placeholderTextColor="#8BA1C2"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />

              <Label style={{ marginTop: 12 }}>
                <Ionicons name="lock-closed" size={16} color="#C9D7F1" />  비밀번호
              </Label>
              <StyledInput
                placeholder="••••••••"
                placeholderTextColor="#8BA1C2"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
              />

              <PrimaryButton disabled={loading} onPress={onLogin} activeOpacity={0.8}>
                <PrimaryText>{loading ? '로그인 중...' : '로그인'}</PrimaryText>
              </PrimaryButton>

              <SecondaryButton onPress={() => Alert.alert('회원가입', '회원가입 화면으로 라우팅하세요.')}>
                <SecondaryText>회원가입</SecondaryText>
              </SecondaryButton>

              <LinksRow>
                <LinkBtn onPress={() => Alert.alert('비밀번호 재설정', '비밀번호 찾기 플로우를 연결하세요.')}>
                  <LinkText>비밀번호를 잊으셨나요?</LinkText>
                </LinkBtn>
                <Dot />
                <LinkBtn onPress={() => Alert.alert('회원가입', '회원가입 화면으로 라우팅하세요.')}>
                  <LinkText>회원가입</LinkText>
                </LinkBtn>
              </LinksRow>
            </Form>

            {/* 바닥 여백: 작은 화면에서 버튼이 키보드에 가려지지 않게 */}
            <View style={{ height: 16 }} />
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </Safe>
  );
}

/* ===== styled-components ===== */
const Safe = styled.SafeAreaView`
  flex: 1;
  background-color: #0b1220;
`;

const Container = styled.View`
  flex: 1;
  padding: 24px 24px 16px 24px;
`;

const Header = styled.View`
  align-items: center;
  margin-bottom: 24px;
`;

const Brand = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #a3b3d1;
  letter-spacing: 1px;
  margin-bottom: 8px;
`;

const Title = styled.Text`
  font-size: 32px;
  font-weight: 800;
  color: #e6eef8;
`;

const Subtitle = styled.Text`
  margin-top: 6px;
  font-size: 14px;
  color: #8ba1c2;
  text-align: center;
`;

const Form = styled.View`
  flex: 1;
`;

const Label = styled.Text`
  color: #c9d7f1;
  font-size: 14px;
  margin-bottom: 6px;
`;

const StyledInput = styled(TextInput)`
  background-color: #121b2e;
  border: 1px solid #1e2a44;
  border-radius: 12px;
  padding: 14px;
  color: #e6eef8;
  font-size: 16px;
  margin-bottom: 12px;
`;

const PrimaryButton = styled(TouchableOpacity)`
  margin-top: 12px;
  border-radius: 12px;
  padding: 14px 16px;
  align-items: center;
  background-color: #4f73ff;
  opacity: ${(props: { disabled?: boolean }) => (props.disabled ? 0.7 : 1)};
`;

const PrimaryText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
`;

const SecondaryButton = styled(TouchableOpacity)`
  margin-top: 10px;
  border-radius: 12px;
  padding: 12px 16px;
  align-items: center;
  background-color: #1a2642;
  border: 1px solid #2a3b61;
`;

const SecondaryText = styled.Text`
  color: #9fbaff;
  font-size: 15px;
  font-weight: 600;
`;

const LinksRow = styled.View`
  margin-top: 18px;
  flex-direction: row;
  align-items: center;
  column-gap: 10px;
  justify-content: center;
`;

const LinkBtn = styled(TouchableOpacity)``;

const LinkText = styled.Text`
  color: #9fbaff;
`;

const Dot = styled.View`
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background-color: #314468;
`;
