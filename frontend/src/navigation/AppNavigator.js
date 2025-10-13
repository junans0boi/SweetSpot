import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SignupNameScreen from '../screens/SignupNameScreen';
import SignupTermsScreen from '../screens/SignupTermsScreen';
import SignupCompleteScreen from '../screens/SignupCompleteScreen';
import MainTabNavigator from './MainTabNavigator'; // MainTabNavigator import

const Stack = createStackNavigator();

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="SignupName" component={SignupNameScreen} />
        <Stack.Screen name="SignupTerms" component={SignupTermsScreen} />
        <Stack.Screen name="SignupComplete" component={SignupCompleteScreen} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    // ✨ useAuth에서 authState를 직접 가져와 isAuthenticated를 확인합니다.
    const { authState } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {authState.isAuthenticated ? (
                // 토큰이 있으면 메인 탭 네비게이터를 보여줌
                <Stack.Screen name="MainApp" component={MainTabNavigator} />
            ) : (
                // 토큰이 없으면 인증 스택을 보여줌
                <Stack.Screen name="Auth" component={AuthStack} />
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;

