// src/screens/SignupCompleteScreen.js

import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const SignupCompleteScreen = ({ navigation, route }) => {
    const { name } = route.params;

    // 로그인 화면으로 돌아가되, 중간의 회원가입 화면들은 모두 스택에서 제거
    const goToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>{name}님,</Text>
                <Text style={styles.title}>회원가입을 축하합니다!</Text>
                {/* 이미지는 assets 폴더에 넣고 경로를 맞게 수정해야 합니다. */}
                {/* <Image source={require('../assets/complete.png')} style={styles.image} /> */}
            </View>
            <View style={styles.buttonWrapper}>
                <TouchableOpacity style={styles.nextButton} onPress={goToLogin}>
                    <Text style={styles.nextButtonText}>스윗스팟 홈으로 이동</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
    image: { width: 200, height: 200, marginTop: 40 },
    buttonWrapper: { padding: 20 },
    nextButton: { backgroundColor: '#000000', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
    nextButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});

export default SignupCompleteScreen;