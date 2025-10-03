// src/screens/LoginScreen.js

import React from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// [1. 추가] AntDesign 아이콘 컴포넌트 불러오기
import { AntDesign } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                {/* 1. 상단 텍스트 영역 */}
                <View style={styles.header}>
                    <Text style={styles.title}>어디를 가야할지 고민일때는</Text>
                    <Text style={styles.subtitle}>스윗스팟!</Text>
                </View>

                {/* 2. 이메일, 비밀번호 입력 영역 */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>이메일</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="이메일을 입력해주세요."
                        keyboardType="email-address"
                    />

                    <Text style={styles.inputLabel}>비밀번호</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="영문, 숫자, 특수문자 조합 8자리 이상"
                        secureTextEntry={true}
                    />
                </View>

                {/* 3. 버튼 영역 */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.loginButton}>
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

                    {/* [2. 수정] 구글 버튼에 아이콘 추가 */}
                    <TouchableOpacity style={styles.googleButton}>
                        {/* 아이콘 컴포넌트 추가 */}
                        <AntDesign name="google" size={24} color="black" style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Google로 로그인</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

// 스타일 시트
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