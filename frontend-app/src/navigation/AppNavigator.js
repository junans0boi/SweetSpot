import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SignupNameScreen from '../screens/SignupNameScreen';
import SignupTermsScreen from '../screens/SignupTermsScreen';
import SignupCompleteScreen from '../screens/SignupCompleteScreen';
import MainTabNavigator from './MainTabNavigator';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import SavedPlacesScreen from '../screens/SavedScreen';
import MyReviewsScreen from '../screens/MyReviewsScreen';
import EditProfileScreen from '../screens/EditProfileScreen'; // ✅ 추가
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

// ✅ 메인 앱 스택: 탭 네비게이터와 상세 페이지를 포함
const MainAppStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
        <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
        <Stack.Screen name="SavedPlaces" component={SavedPlacesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MyReviews" component={MyReviewsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    const { authState } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {authState.isAuthenticated ? (
                // ✅ 인증된 사용자는 메인 앱 스택으로 이동
                <Stack.Screen name="MainApp" component={MainAppStack} />
            ) : (
                <Stack.Screen name="Auth" component={AuthStack} />
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
