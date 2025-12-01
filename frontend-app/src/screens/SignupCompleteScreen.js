import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import AuthButton from '../components/auth/AuthButton';

const SignupCompleteScreen = ({ navigation, route }) => {
    const { name } = route.params;

    const goToLogin = () => {
        // 회원가입 스택을 모두 리셋하고 로그인 화면으로 이동
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>{name}님,</Text>
                <Text style={styles.title}>회원가입을 축하합니다!</Text>
            </View>
            <View style={styles.buttonWrapper}>
                <AuthButton title="스윗스팟 홈으로 이동" onPress={goToLogin} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
    buttonWrapper: { padding: 20 },
});

export default SignupCompleteScreen;
