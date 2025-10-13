import React, {useState, useEffect} from 'react';
import {SafeAreaView, View, Text, StyleSheet} from 'react-native';
import AuthHeader from '../components/auth/AuthHeader';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';

const SignupScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordConfirmError, setPasswordConfirmError] = useState('');

    useEffect(() => {
        // [수정] 비밀번호 규칙 검사 로직 강화
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
        if (password.length > 0 && !passwordRegex.test(password)) {
            setPasswordError('영문, 숫자, 특수문자 조합 8자리 이상 입력해주세요.');
        } else {
            setPasswordError('');
        }

        if (passwordConfirm.length > 0 && password !== passwordConfirm) {
            setPasswordConfirmError('비밀번호가 일치하지 않습니다.');
        } else {
            setPasswordConfirmError('');
        }
    }, [password, passwordConfirm]);

    const isButtonEnabled = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = emailRegex.test(email);

        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
        const isPasswordValid = passwordRegex.test(password);

        const doPasswordsMatch = password === passwordConfirm;

        return isEmailValid && isPasswordValid && doPasswordsMatch;
    };

    const handleNext = () => {
        if (isButtonEnabled()) {
            // [수정] 다음 화면으로 이동하면서 email과 password 값을 전달합니다.
            navigation.navigate('SignupName', {
                email: email,
                password: password
            });
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <AuthHeader title="회원가입" onBackPress={() => navigation.goBack()}/>
            <View style={styles.contentContainer}>
                <View style={styles.inputWrapper}>
                    <AuthInput
                        label="이메일"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="이메일을 입력해주세요."
                        keyboardType="email-address"
                    />
                    <AuthInput
                        label="비밀번호"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="영문, 숫자, 특수문자 조합 8자리 이상"
                        secureTextEntry
                        errorText={passwordError}
                    />
                    <AuthInput
                        label="비밀번호 확인"
                        value={passwordConfirm}
                        onChangeText={setPasswordConfirm}
                        placeholder="비밀번호를 다시 입력해주세요."
                        secureTextEntry
                        errorText={passwordConfirmError}
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <AuthButton
                        title="다음"
                        onPress={handleNext}
                        disabled={!isButtonEnabled()}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

// ... styles 객체는 이전과 거의 동일 ...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        width: '100%',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    inputContainer: {
        // flex: 2, // flex 비율을 조정하여 공간 확보
        paddingHorizontal: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 24,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        paddingBottom: 8,
        fontSize: 16,
        marginBottom: 8,
    },
    errorText: {
        color: 'red',
        marginTop: 4,
        fontSize: 12,
    },
    buttonWrapper: {
        padding: 20,
        justifyContent: 'flex-end' // 버튼을 하단에 위치
    },
    nextButton: {
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonEnabled: {
        backgroundColor: '#000000',
    },
    nextButtonDisabled: {
        backgroundColor: '#E0E0E0',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});


export default SignupScreen;