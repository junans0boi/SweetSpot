import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 하단 탭바에서만 사용하는 데이터이므로 여기로 이동했습니다.
const navigationTabs = [
    { id: 'home', name: '홈', icon: 'home-outline' },
    { id: 'recommend', name: '추천', icon: 'star-outline' },
    { id: 'save', name: '저장', icon: 'bookmark-outline' },
    { id: 'mypage', name: '내 정보', icon: 'person-outline' },
];

const BottomTabBar = ({ activeTab, setActiveTab }) => (
    <View style={styles.bottomTabBar}>
        {navigationTabs.map((tab) => (
            <TouchableOpacity key={tab.id} style={styles.tabItem} onPress={() => setActiveTab(tab.id)}>
                <Ionicons
                    name={activeTab === tab.id ? tab.icon.replace('-outline', '') : tab.icon}
                    size={26}
                    color={activeTab === tab.id ? '#FF7A00' : '#888'}
                />
                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                    {tab.name}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

const styles = StyleSheet.create({
    bottomTabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: Platform.OS === 'ios' ? 85 : 65,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    tabItem: {
        alignItems: 'center',
        padding: 5,
    },
    tabText: {
        fontSize: 11,
        color: '#888',
        marginTop: 4,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FF7A00',
        fontWeight: 'bold',
    },
});

export default BottomTabBar;
