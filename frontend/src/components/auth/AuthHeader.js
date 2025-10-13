import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const AuthHeader = ({ title, onBackPress }) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress}>
            <AntDesign name="left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
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
});

export default AuthHeader;

