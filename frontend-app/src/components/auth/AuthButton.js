import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const AuthButton = ({ title, onPress, disabled = false, isLoading = false }) => (
    <TouchableOpacity
        style={[styles.button, disabled ? styles.buttonDisabled : styles.buttonEnabled]}
        onPress={onPress}
        disabled={disabled || isLoading}
    >
        {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
        ) : (
            <Text style={styles.buttonText}>{title}</Text>
        )}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    buttonEnabled: {
        backgroundColor: '#000000',
    },
    buttonDisabled: {
        backgroundColor: '#E0E0E0',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

export default AuthButton;

