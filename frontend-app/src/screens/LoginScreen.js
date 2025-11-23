import React, {useState} from 'react';
import {SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator} from 'react-native';
import {AntDesign} from '@expo/vector-icons';
import {useAuth} from '../contexts/AuthContext';
import API_BASE_URL from '../config/api';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';

// ✨ 구글/웹 인증 관련 라이브러리 import 추가
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({navigation}) => {
    const {signIn} = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            // Expo Go에서 테스트 시, useProxy: true 옵션이 필요합니다.
            const redirectUri = AuthSession.makeRedirectUri({useProxy: true});
            const authUrl = `${API_BASE_URL}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;


            console.log("프론트엔드가 요청하는 최종 복귀 주소:", redirectUri);
            console.log("백엔드로 요청하는 전체 인증 주소:", authUrl);

            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

            if (result.type === 'success' && result.url) {
                const url = new URL(result.url);
                const accessToken = url.searchParams.get('accessToken');
                const refreshToken = url.searchParams.get('refreshToken');

                if (accessToken && refreshToken) {
                    signIn({accessToken, refreshToken});
                } else {
                    Alert.alert('Google 로그인 실패', '토큰을 받아오지 못했습니다.');
                }
            }
        } catch (error) {
            console.error('Google 로그인 오류:', error);
            Alert.alert('Google 로그인 중 오류가 발생했습니다.');
        }
    };
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('오류', '이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }
        setIsLoading(true);
        try {
            // API_BASE_URL 앞에 http://를 붙여 완전한 URL을 만듭니다.
            const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password}),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '로그인에 실패했습니다.');
            }
            signIn(data);
        } catch (error) {
            Alert.alert('로그인 오류', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>어디를 가야할지 고민일때는</Text>
                    <Text style={styles.subtitle}>스윗스팟!</Text>
                </View>

                <View style={styles.inputContainer}>
                    <AuthInput
                        label="이메일"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="이메일을 입력해주세요."
                        keyboardType="email-address"
                    />
                    <AuthInput
                        label="비밀번호"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="비밀번호를 입력해주세요."
                        secureTextEntry
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <AuthButton
                        title="로그인"
                        onPress={handleLogin}
                        isLoading={isLoading}
                        disabled={!email || !password}
                    />
                    <View style={styles.subButtonContainer}>
                        <TouchableOpacity>
                            <Text style={styles.subButtonText}>비밀번호 재설정</Text>
                        </TouchableOpacity>
                        <Text style={styles.subButtonDivider}>|</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.subButtonText}>회원가입</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                        <AntDesign name="google" size={24} color="black" style={styles.googleIcon}/>
                        <Text style={styles.googleButtonText}>Google로 로그인</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: '15%',
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 24,
    },
    subtitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 8,
    },
    inputContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    subButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 16,
    },
    subButtonText: {
        fontSize: 14,
        color: '#757575',
    },
    subButtonDivider: {
        marginHorizontal: 8,
        color: '#E0E0E0',
    },
    googleButton: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleIcon: {
        marginRight: 10,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
});

export default LoginScreen;

