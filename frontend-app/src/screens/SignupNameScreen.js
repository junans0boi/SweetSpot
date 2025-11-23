import React, {useState} from 'react';
import {SafeAreaView, View, StyleSheet} from 'react-native';
import AuthHeader from '../components/auth/AuthHeader';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';

const SignupNameScreen = ({navigation, route}) => {
    const {email, password} = route.params;
    const [name, setName] = useState('');
    const isButtonEnabled = name.length > 0;

    const handleNext = () => {
        if (isButtonEnabled) {
            navigation.navigate('SignupTerms', {email, password, name});
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <AuthHeader title="회원가입" onBackPress={() => navigation.goBack()}/>
            <View style={styles.contentContainer}>
                <View style={styles.inputWrapper}>
                    <AuthInput
                        label="사용자 이름"
                        value={name}
                        onChangeText={setName}
                        placeholder="사용할 사용자 이름을 작성해 주세요."
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <AuthButton
                        title="다음"
                        onPress={handleNext}
                        disabled={!isButtonEnabled}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#FFFFFF'},
    contentContainer: {flex: 1, padding: 20, justifyContent: 'space-between'},
    inputWrapper: {marginTop: 40},
    buttonWrapper: {paddingBottom: 20},
});

export default SignupNameScreen;
