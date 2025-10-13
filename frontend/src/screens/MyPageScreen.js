// MyPageScreen.js (수정 후)

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // 화면에 포커스 될 때마다 실행하기 위한 Hook
import { useAuth } from '../contexts/AuthContext'; // AuthContext 사용
import API_BASE_URL from '../config/api'; // API 기본 주소
import axios from 'axios'; // API 통신을 위한 라이브러리

const menuItems = [
    { id: 'notice', title: '공지사항', icon: 'megaphone-outline' },
    { id: 'event', title: '이벤트', icon: 'gift-outline' },
    { id: 'settings', title: '앱 설정', icon: 'settings-outline' },
    { id: 'logout', title: '로그아웃', icon: 'log-out-outline' },
];

export default function MyPageScreen() {
    const { authState, signOut } = useAuth(); // AuthContext에서 인증 상태와 signOut 함수 가져오기
    const [userInfo, setUserInfo] = useState(null); // 사용자 정보를 담을 state
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태

    // useFocusEffect: 화면이 보일 때마다 API를 호출하여 최신 정보를 유지
    useFocusEffect(
        React.useCallback(() => {
            const fetchUserInfo = async () => {
                if (!authState.accessToken) return; // 토큰이 없으면 실행하지 않음

                setIsLoading(true);
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
                        headers: {
                            'Authorization': `Bearer ${authState.accessToken}` // 헤더에 Access Token 추가
                        }
                    });
                    setUserInfo(response.data); // 성공 시 사용자 정보 저장
                } catch (error) {
                    console.error("사용자 정보 조회 실패:", error);
                    Alert.alert("오류", "사용자 정보를 불러오는 데 실패했습니다.");
                    // 예: 토큰 만료 등의 이유로 에러 발생 시 로그아웃 처리도 가능
                    // signOut();
                } finally {
                    setIsLoading(false);
                }
            };

            fetchUserInfo();
        }, [authState.accessToken]) // accessToken이 변경될 때마다 재실행
    );

    // 메뉴 아이템 클릭 핸들러
    const handleMenuItemPress = (id) => {
        if (id === 'logout') {
            Alert.alert(
                "로그아웃",
                "정말 로그아웃 하시겠습니까?",
                [
                    { text: "취소", style: "cancel" },
                    { text: "확인", onPress: () => signOut() } // 확인 시 signOut 함수 호출
                ]
            );
        } else {
            Alert.alert("알림", `${id} 메뉴는 현재 준비 중입니다.`);
        }
    };

    // 로딩 중일 때 보여줄 화면
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#FF7A00" />
            </SafeAreaView>
        );
    }

    // 사용자 정보가 없을 때 (오류 등)
    if (!userInfo) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
                <Text>사용자 정보를 불러올 수 없습니다.</Text>
            </SafeAreaView>
        );
    }

    // 정상적으로 정보가 로드됐을 때 보여줄 화면
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>내 정보</Text>
            </View>
            <ScrollView>
                <View style={styles.profileSection}>
                    <Image
                        // pictureUrl이 있으면 사용하고, 없으면 기본 이미지 표시
                        source={{ uri: userInfo.pictureUrl || 'https://placehold.co/100x100/FFDDAA/333?text=Me' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.profileName}>{userInfo.name}</Text>
                    <Text style={styles.profileEmail}>{userInfo.email}</Text>
                </View>

                <View style={styles.menuSection}>
                    {menuItems.map(item => (
                        <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => handleMenuItemPress(item.id)}>
                            <Ionicons name={item.icon} size={22} color={item.id === 'logout' ? '#ff4d4d' : '#555'} style={styles.menuIcon} />
                            <Text style={[styles.menuText, item.id === 'logout' && styles.logoutText]}>{item.title}</Text>
                            <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f8f8' },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
    header: { paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    profileSection: { alignItems: 'center', padding: 30, backgroundColor: '#fff' },
    profileImage: { width: 90, height: 90, borderRadius: 45, marginBottom: 15 },
    profileName: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
    profileEmail: { fontSize: 14, color: '#888' },
    menuSection: { marginTop: 10 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    menuIcon: { marginRight: 15 },
    menuText: { flex: 1, fontSize: 16 },
    logoutText: { color: '#ff4d4d', fontWeight: '500' } // 로그아웃 텍스트 스타일 추가
});