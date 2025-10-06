import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NaverMapView } from '@mj-studio/react-native-naver-map'; // ✅ 수정됨
import { useAuth } from '../contexts/AuthContext';

const MainScreen = () => {
    const { signOut } = useAuth();

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <NaverMapView
                style={styles.mapArea}
                initialCamera={{
                    latitude: 37.3613,
                    longitude: 126.935,
                    zoom: 15,
                }}
                onInitialized={() => console.log('✅ 네이버 지도 초기화되었습니다!')}
            />

            <View style={styles.filterArea}>
                <Text>검색 바와 필터 버튼이 들어올 영역이란다</Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    mapArea: { flex: 1 },
    filterArea: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    logoutButton: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        backgroundColor: '#FF6347',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

export default MainScreen;