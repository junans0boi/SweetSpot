import React, { createContext, useState, useContext, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// 1. Context 생성: 앱 전역에서 사용할 수 있는 '인증' 관련 저장 공간
const AuthContext = createContext();

// 2. AuthProvider 컴포넌트: 앱 전체를 감싸서 인증 상태를 관리하고 제공
export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 앱이 시작될 때 SecureStore에서 토큰을 불러와 로그인 상태를 복원
        const loadTokens = async () => {
            try {
                const accessToken = await SecureStore.getItemAsync('accessToken');
                const refreshToken = await SecureStore.getItemAsync('refreshToken');

                if (accessToken) {
                    setAuthState({
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                    });
                }
            } catch (e) {
                console.error('토큰 불러오기 실패:', e);
            }
            setIsLoading(false);
        };
        loadTokens();
    }, []);

    // 다른 컴포넌트에서 사용할 함수와 값들
    const authContext = {
        signIn: async (tokens) => {
            try {
                await SecureStore.setItemAsync('accessToken', tokens.accessToken);
                await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
                setAuthState({
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    isAuthenticated: true,
                });
            } catch (e) {
                console.error('토큰 저장 실패:', e);
            }
        },
        signOut: async () => {
            try {
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                setAuthState({
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            } catch (e) {
                console.error('토큰 삭제 실패:', e);
            }
        },
        authState,
        isLoading,
    };

    // 토큰을 불러오는 동안 로딩 화면을 보여줌
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={authContext}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. useAuth 커스텀 훅: 다른 컴포넌트에서 Context 값을 쉽게 가져다 쓸 수 있게 함
export const useAuth = () => useContext(AuthContext);

