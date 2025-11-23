import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ userCity, onLocationPress, onSearchPress }) => (
    <View style={styles.header}>
        <TouchableOpacity style={styles.headerLocationContainer} onPress={onLocationPress}>
            <Ionicons name="location-sharp" size={18} color="#333" />
            <Text style={styles.headerLocationText}>{userCity || '위치 찾는 중...'}</Text>
            <Ionicons name="chevron-down-outline" size={16} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerSearchButton} onPress={onSearchPress}>
            <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    headerLocationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    headerLocationText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginHorizontal: 6,
    },
    headerSearchButton: {
        padding: 5,
    },
});

export default Header;
