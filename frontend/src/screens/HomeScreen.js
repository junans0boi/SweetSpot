// src/screens/HomeScreen.js

import React from 'react';
// [1. 추가] 버튼과 스타일링을 위해 TouchableOpacity, StyleSheet를 불러옵니다.
import { SafeAreaView, Text, TouchableOpacity, StyleSheet } from 'react-native';
// [2. 추가] AuthContext의 signOut 함수를 사용하기 위해 useAuth를 불러옵니다.
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = () => {
    // [3. 추가] useAuth 훅을 사용해 signOut 함수를 가져옵니다.
    const { signOut } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.text}>🏠 홈 화면입니다!</Text>
            <Text style={styles.welcomeText}>로그인에 성공하셨습니다.</Text>

            {/* [4. 추가] 로그아웃 버튼 */}
            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

// [5. 추가] 버튼 스타일링
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    welcomeText: {
        fontSize: 18,
        marginTop: 8,
        color: '#757575',
    },
    logoutButton: {
        marginTop: 40,
        backgroundColor: '#FF6347',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

export default HomeScreen;