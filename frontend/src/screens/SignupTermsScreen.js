// src/screens/SignupTermsScreen.js

import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';

const SignupTermsScreen = ({ navigation, route }) => {
    const { email, password, name } = route.params;

    // 각 체크박스의 선택 여부를 기억할 state들 (true/false)
    const [agreeAll, setAgreeAll] = useState(false);
    const [agreeAge, setAgreeAge] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);

    // '전체 동의' 체크박스 로직
    const handleAgreeAll = () => {
        const nextValue = !agreeAll;
        setAgreeAll(nextValue);
        setAgreeAge(nextValue);
        setAgreeTerms(nextValue);
        setAgreePrivacy(nextValue);
        setAgreeMarketing(nextValue);
    };

    // 개별 체크박스를 누를 때 '전체 동의' 상태 업데이트
    useEffect(() => {
        if (agreeAge && agreeTerms && agreePrivacy && agreeMarketing) {
            setAgreeAll(true);
        } else {
            setAgreeAll(false);
        }
    }, [agreeAge, agreeTerms, agreePrivacy, agreeMarketing]);

    // 필수 항목들이 모두 체크되었는지 확인
    const isButtonEnabled = agreeAge && agreeTerms && agreePrivacy;

    const handleComplete = () => {
        if (isButtonEnabled) {
            console.log('가입 정보 최종:', { email, password, name, agreeMarketing });
            // API 서버에 회원가입 요청을 보내는 로직이 여기에 들어갑니다.

            // 성공 시, 완료 화면으로 이동
            navigation.navigate('SignupComplete', { name });
        }
    };

    // 체크박스 UI를 위한 재사용 컴포넌트
    const Checkbox = ({ label, value, onValueChange, isRequired }) => (
        <TouchableOpacity style={styles.checkboxContainer} onPress={onValueChange}>
            <Ionicons
                name={value ? 'checkmark-circle' : 'ellipse-outline'}
                size={28}
                color={value ? '#000000' : '#E0E0E0'}
            />
            <Text style={styles.checkboxLabel}>
                {isRequired ? <Text style={styles.requiredText}>(필수) </Text> : <Text>(선택) </Text>}
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>약관동의</Text>
            </View>
            <View style={styles.content}>
                <Checkbox label="전체동의" value={agreeAll} onValueChange={handleAgreeAll} />
                <View style={styles.divider} />
                <Checkbox label="만 18세 이상입니다." value={agreeAge} onValueChange={() => setAgreeAge(!agreeAge)} isRequired />
                <Checkbox label="이용약관에 동의합니다." value={agreeTerms} onValueChange={() => setAgreeTerms(!agreeTerms)} isRequired />
                <Checkbox label="개인정보 수집 및 이용에 동의합니다." value={agreePrivacy} onValueChange={() => setAgreePrivacy(!agreePrivacy)} isRequired />
                <Checkbox label="마케팅 정보 수신에 동의합니다." value={agreeMarketing} onValueChange={() => setAgreeMarketing(!agreeMarketing)} />
            </View>
            <View style={{ flex: 1 }} />
            <View style={styles.buttonWrapper}>
                <TouchableOpacity
                    style={[styles.nextButton, isButtonEnabled ? styles.nextButtonEnabled : styles.nextButtonDisabled]}
                    onPress={handleComplete}
                    disabled={!isButtonEnabled}
                >
                    <Text style={styles.nextButtonText}>가입완료</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
    content: { padding: 20 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    checkboxLabel: { fontSize: 16, marginLeft: 12 },
    requiredText: { color: 'blue' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
    buttonWrapper: { padding: 20 },
    nextButton: { paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
    nextButtonEnabled: { backgroundColor: '#000000' },
    nextButtonDisabled: { backgroundColor: '#E0E0E0' },
    nextButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});

export default SignupTermsScreen;