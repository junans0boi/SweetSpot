import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// 화면 컴포넌트들
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SignupNameScreen from '../screens/SignupNameScreen';
import SignupTermsScreen from '../screens/SignupTermsScreen';
import SignupCompleteScreen from '../screens/SignupCompleteScreen';
import MainScreen from '../screens/MainScreen';

const Stack = createStackNavigator();

// --- 인증 관련 화면들을 모아놓은 스택 ---
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="SignupName" component={SignupNameScreen} />
        <Stack.Screen name="SignupTerms" component={SignupTermsScreen} />
        <Stack.Screen name="SignupComplete" component={SignupCompleteScreen} />
    </Stack.Navigator>
);

// --- 로그인 후 진입하는 화면들을 모아놓은 스택 ---
const MainStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainScreen} />
        {/* 여기에 지도 화면, 마이페이지 화면 등을 추가할 수 있습니다. */}
    </Stack.Navigator>
);

const AppNavigator = () => {
    const { userToken } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken == null ? (
                // 토큰이 없으면 인증 스택을 보여줌
                <Stack.Screen name="Auth" component={AuthStack} />
            ) : (
                // 토큰이 있으면 메인 스택을 보여줌
                <Stack.Screen name="MainApp" component={MainStack} />
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
