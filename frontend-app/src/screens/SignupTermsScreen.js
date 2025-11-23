import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@env';
import AuthHeader from '../components/auth/AuthHeader';
import AuthButton from '../components/auth/AuthButton';

const SignupTermsScreen = ({ navigation, route }) => {
    const { email, password, name } = route.params;
    const [agreeAll, setAgreeAll] = useState(false);
    const [agreeAge, setAgreeAge] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

    const handleAgreeAll = () => {
        const nextValue = !agreeAll;
        setAgreeAll(nextValue);
        setAgreeAge(nextValue);
        setAgreeTerms(nextValue);
        setAgreePrivacy(nextValue);
        setAgreeMarketing(nextValue);
    };

    useEffect(() => {
        if (agreeAge && agreeTerms && agreePrivacy && agreeMarketing) setAgreeAll(true);
        else setAgreeAll(false);
    }, [agreeAge, agreeTerms, agreePrivacy, agreeMarketing]);

    const isButtonEnabled = agreeAge && agreeTerms && agreePrivacy;

    const handleComplete = async () => {
        if (isButtonEnabled) {
            setIsLoading(true); // 로딩 시작
            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, name }),
                });
                if (response.ok) {
                    navigation.navigate('SignupComplete', { name });
                } else {
                    const error = await response.json();
                    Alert.alert('회원가입 실패', error.message || '서버 오류입니다.');
                }
            } catch (error) {
                console.error('회원가입 오류:', error);
                Alert.alert('서버 에러', '서버에 연결할 수 없습니다.');
            } finally {
                setIsLoading(false); // 로딩 종료
            }
        }
    };

    const Checkbox = ({ label, value, onValueChange, isRequired }) => (
        <TouchableOpacity style={styles.checkboxContainer} onPress={onValueChange}>
            <Ionicons name={value ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={value ? '#000000' : '#E0E0E0'} />
            <Text style={styles.checkboxLabel}>
                {isRequired ? <Text style={styles.requiredText}>(필수) </Text> : <Text>(선택) </Text>}
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <AuthHeader title="약관동의" onBackPress={() => navigation.goBack()} />
            <View style={styles.content}>
                <Checkbox label="전체동의" value={agreeAll} onValueChange={handleAgreeAll} />
                <View style={styles.divider} />
                <Checkbox label="만 18세 이상입니다." value={agreeAge} onValueChange={() => setAgreeAge(!agreeAge)} isRequired />
                <Checkbox label="이용약관에 동의합니다." value={agreeTerms} onValueChange={() => setAgreeTerms(!agreeTerms)} isRequired />
                <Checkbox label="개인정보 수집 및 이용에 동의합니다." value={agreePrivacy} onValueChange={() => setAgreePrivacy(!agreePrivacy)} isRequired />
                <Checkbox label="마케팅 정보 수신에 동의합니다." value={agreeMarketing} onValueChange={() => setAgreeMarketing(!agreeMarketing)} />
            </View>
            <View style={styles.buttonWrapper}>
                <AuthButton
                    title="가입완료"
                    onPress={handleComplete}
                    disabled={!isButtonEnabled}
                    isLoading={isLoading}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    content: { flex: 1, padding: 20 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    checkboxLabel: { fontSize: 16, marginLeft: 12 },
    requiredText: { color: 'blue' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
    buttonWrapper: { padding: 20 },
});

export default SignupTermsScreen;

