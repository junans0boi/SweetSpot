import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const AuthInput = ({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default', errorText }) => (
    <View style={styles.container}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize="none"
        />
        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
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
    },
    errorText: {
        color: 'red',
        marginTop: 4,
        fontSize: 12,
    },
});

export default AuthInput;

