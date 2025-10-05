import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import SignupNameScreen from './src/screens/SignupNameScreen';
import SignupTermsScreen from './src/screens/SignupTermsScreen';
import SignupCompleteScreen from './src/screens/SignupCompleteScreen';
import HomeScreen from './src/screens/HomeScreen';
import { View, ActivityIndicator } from 'react-native';

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

const AppStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    const { authState, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {authState.isAuthenticated ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}