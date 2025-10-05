import React from 'react';
// 🔻 수정: View와 ScrollView를 react-native에서 불러옵니다.
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
// 🔻 추가: 로그아웃 기능을 위해 AuthContext를 불러옵니다.
import { useAuth } from '../contexts/AuthContext';

const MainScreen = () => {
    const { signOut } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            {/* 1. 지도 영역 */}
            <View style={styles.mapArea}>
                <Text>지도 API가 연동될 영역</Text>
            </View>

            {/* 2. 검색 및 필터 영역 */}
            <View style={styles.filterArea}>
                <Text>검색 바와 필터 버튼이 들어올 영역</Text>
            </View>

            {/* 3. 장소 목록 */}
            <ScrollView style={styles.listArea}>
                <Text>장소 카드 목록이 들어올 영역</Text>
                <Text>장소 카드 목록이 들어올 영역</Text>
                <Text>장소 카드 목록이 들어올 영역</Text>
            </ScrollView>

            {/* 4. 로그아웃 버튼 */}
            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mapArea: {
        flex: 4, // 화면의 40% 정도를 차지
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterArea: {
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    listArea: {
        flex: 6, // 화면의 60% 정도를 차지
        backgroundColor: '#fff',
    },
    logoutButton: {
        position: 'absolute', // 화면 위에 버튼을 띄웁니다.
        bottom: 40,
        right: 20,
        backgroundColor: '#FF6347',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        // 그림자 효과 (iOS & Android)
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
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

