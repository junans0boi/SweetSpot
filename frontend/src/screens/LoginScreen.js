// src/screens/LoginScreen.js

import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../contexts/AuthContext'; // [1. 추가] useAuth 훅을 불러옵니다.

const BACKEND_URL = 'http://localhost:8088';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
    const { signIn } = useAuth(); // [2. 추가] AuthContext의 signIn 함수를 가져옵니다.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleGoogleLogin = async () => {
        try {
            const redirectUri = AuthSession.makeRedirectUri({ scheme: 'exp', useProxy: true, path: 'oauth-redirect' });
            const authUrl = `${BACKEND_URL}/oauth2/authorization/google`;
            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

            if (result.type === 'success' && result.url) {
                const params = new URLSearchParams(result.url.split('?')[1]);
                const accessToken = params.get('accessToken');
                const refreshToken = params.get('refreshToken');

                if (accessToken && refreshToken) {
                    // [3. 수정] console.log, Alert, navigation 대신 signIn 함수를 호출합니다.
                    signIn({ accessToken, refreshToken });
                } else {
                    Alert.alert('Google 로그인 실패', '토큰을 받아오지 못했습니다.');
                }
            } else if (result.type !== 'cancel') {
                Alert.alert('Google 로그인 취소 또는 실패');
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
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json(); // { accessToken, refreshToken }
                // [3. 수정] console.log, Alert, navigation 대신 signIn 함수를 호출합니다.
                signIn(data);
            } else {
                const error = await response.json();
                Alert.alert('로그인 실패', error.message || '이메일 또는 비밀번호를 확인해주세요.');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            Alert.alert('서버 에러', '서버에 연결할 수 없습니다.');
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
                    <Text style={styles.inputLabel}>이메일</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="이메일을 입력해주세요."
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                    <Text style={styles.inputLabel}>비밀번호</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="영문, 숫자, 특수문자 조합 8자리 이상"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>로그인</Text>
                    </TouchableOpacity>
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        width: '70%',
        flex: 1,
    },
    header: {
        flex: 2,
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
        flex: 2,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        paddingBottom: 8,
        fontSize: 16,
        marginBottom: 24,
    },
    buttonContainer: {
        flex: 2,
    },
    loginButton: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#BDBDBD',
    },
    subButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
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
        // [추가] 아이콘과 텍스트를 가로로 나열하기 위해 flexDirection:'row'
        flexDirection: 'row',
        alignItems: 'center', // 세로 중앙 정렬
        justifyContent: 'center', // 가로 중앙 정렬
    },
    // [추가] 아이콘과 텍스트 사이 간격 조정을 위한 스타일
    googleIcon: {
        marginRight: 10, // 텍스트와의 간격
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
});

export default LoginScreen;