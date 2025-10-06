import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 🔻 [추가] 네이버 지도 뷰 컴포넌트를 import 합니다.
import NaverMapView from '@mj-studio/react-native-naver-map';

const MainScreen = ({ navigation }) => {

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        navigation.replace('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 🔻 [수정] 지도 영역을 NaverMapView로 교체합니다. 🔻 */}
            <NaverMapView
                style={styles.mapArea}
                // 초기 카메라 위치를 군포시청 근처로 설정합니다.
                initialCamera={{
                    latitude: 37.3613,
                    longitude: 126.935,
                    zoom: 15,
                }}
                onInitialized={() => console.log('Naver Map Initialized!')}
            />

            {/* 2. 검색 및 필터 영역 */}
            <View style={styles.filterArea}>
                <Text>검색 바와 필터 버튼이 들어올 영역</Text>
            </View>

            {/* 3. 로그아웃 버튼 */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
        flex: 1, // 지도가 화면 전체를 채우도록 flex: 1로 변경
    },
    filterArea: {
        position: 'absolute', // 지도의 상단 위에 겹치도록 설정
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
        shadowColor: "#000",
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
