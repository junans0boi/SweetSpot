// src/screens/SignupNameScreen.js

import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

// route 소품은 이전 화면에서 전달받은 데이터를 담고 있습니다.
const SignupNameScreen = ({ navigation, route }) => {
    // 이전 화면에서 넘겨받은 email, password를 route.params에서 꺼냅니다.
    const { email, password } = route.params;

    const [name, setName] = useState('');
    const isButtonEnabled = name.length > 0; // 이름이 한 글자 이상이면 버튼 활성화

    const handleNext = () => {
        if (isButtonEnabled) {
            // 이름 정보까지 포함하여 다음 화면으로 전달
            navigation.navigate('SignupTerms', {
                email,
                password,
                name,
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>회원가입</Text>
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>사용자 이름</Text>
                <TextInput
                    style={styles.input}
                    placeholder="사용할 사용자 이름을 작성해 주세요."
                    value={name}
                    onChangeText={setName}
                />
            </View>
            <View style={{ flex: 1 }} />
            <View style={styles.buttonWrapper}>
                <TouchableOpacity
                    style={[styles.nextButton, isButtonEnabled ? styles.nextButtonEnabled : styles.nextButtonDisabled]}
                    onPress={handleNext}
                    disabled={!isButtonEnabled}
                >
                    <Text style={styles.nextButtonText}>다음</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// 스타일은 SignupScreen과 거의 동일합니다.
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
    inputContainer: { paddingHorizontal: 20, marginTop: 40 },
    inputLabel: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    input: { borderBottomWidth: 1, borderColor: '#E0E0E0', paddingBottom: 8, fontSize: 16 },
    buttonWrapper: { padding: 20 },
    nextButton: { paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
    nextButtonEnabled: { backgroundColor: '#000000' },
    nextButtonDisabled: { backgroundColor: '#E0E0E0' },
    nextButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});

export default SignupNameScreen;