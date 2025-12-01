import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config/api';
import axios from 'axios';

const menuItems = [
    { id: 'my_reviews', title: '내가 쓴 리뷰', icon: 'create-outline' },
    { id: 'saved_places', title: '찜한 장소', icon: 'heart-outline' },
    { id: 'notice', title: '공지사항', icon: 'megaphone-outline' },
    { id: 'settings', title: '앱 설정', icon: 'settings-outline' },
    { id: 'logout', title: '로그아웃', icon: 'log-out-outline' },
];

export default function MyPageScreen() {
    const { authState, signOut } = useAuth();
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 화면이 포커스 될 때마다 사용자 정보 갱신
    useFocusEffect(
        useCallback(() => {
            const fetchUserInfo = async () => {
                if (!authState.accessToken) {
                    setIsLoading(false);
                    return;
                }

                try {
                    const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
                        headers: {
                            'Authorization': `Bearer ${authState.accessToken}`
                        }
                    });
                    setUserInfo(response.data);
                } catch (error) {
                    console.error("사용자 정보 조회 실패:", error);
                    // 토큰 만료 시 자동 로그아웃 처리 (선택 사항)
                    if (error.response && error.response.status === 401) {
                        Alert.alert("세션 만료", "다시 로그인해주세요.");
                        signOut();
                    }
                } finally {
                    setIsLoading(false);
                }
            };

            fetchUserInfo();
        }, [authState.accessToken])
    );

    const handleMenuItemPress = (id) => {
        switch (id) {
            case 'logout':
                Alert.alert(
                    "로그아웃",
                    "정말 로그아웃 하시겠습니까?",
                    [
                        { text: "취소", style: "cancel" },
                        { text: "확인", onPress: () => signOut(), style: 'destructive' }
                    ]
                );
                break;
            case 'saved_places':
                navigation.navigate('MainTabs', { screen: '저장' });
                break;
            case 'my_reviews':
                navigation.navigate('MyReviews'); // ✅ 연결
                break;
            case 'settings':
                // navigation.navigate('EditProfile'); // 프로필 수정 화면 연결
                break;
            default:
                Alert.alert("알림", "준비 중인 메뉴입니다.");
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.center]}>
                <ActivityIndicator size="large" color="#FF7A00" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>마이 페이지</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 프로필 섹션 */}
                <View style={styles.profileCard}>
                    <Image
                        source={{
                            uri: userInfo?.pictureUrl
                                ? userInfo.pictureUrl
                                : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                        }}
                        style={styles.profileImage}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{userInfo?.name}</Text>
                        <Text style={styles.profileEmail}>{userInfo?.email}</Text>
                    </View>

                    {/* ✅ 수정 버튼에 onPress 추가 */}
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditProfile', { userInfo })} // 현재 정보 전달
                    >
                        <Ionicons name="pencil" size={16} color="#888" />
                    </TouchableOpacity>
                </View>
                {/* 메뉴 리스트 */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.menuItem,
                                index === menuItems.length - 1 && styles.lastMenuItem // 마지막 아이템 테두리 제거
                            ]}
                            onPress={() => handleMenuItemPress(item.id)}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[
                                    styles.iconContainer,
                                    item.id === 'logout' && styles.logoutIconContainer
                                ]}>
                                    <Ionicons
                                        name={item.icon}
                                        size={22}
                                        color={item.id === 'logout' ? '#FF3B30' : '#555'}
                                    />
                                </View>
                                <Text style={[
                                    styles.menuText,
                                    item.id === 'logout' && styles.logoutText
                                ]}>
                                    {item.title}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.versionText}>앱 버전 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    scrollContent: { paddingBottom: 30 },

    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    profileImage: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#eee' },
    profileInfo: { flex: 1, marginLeft: 15 },
    profileName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    profileEmail: { fontSize: 14, color: '#888' },
    editButton: { padding: 5 },

    menuContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 15,
        overflow: 'hidden', // 자식 요소가 둥근 모서리를 넘지 않게
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff'
    },
    lastMenuItem: { borderBottomWidth: 0 },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: {
        width: 36, height: 36,
        borderRadius: 18,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12
    },
    logoutIconContainer: { backgroundColor: '#FFF0F0' },
    menuText: { fontSize: 16, color: '#333', fontWeight: '500' },
    logoutText: { color: '#FF3B30' },

    versionText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#aaa',
        fontSize: 12,
    }
});