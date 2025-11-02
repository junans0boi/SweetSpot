import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// ✅ expo-image import 제거

// 카테고리에 따라 다른 아이콘을 반환하는 헬퍼 객체
const categoryIcons = {
    '맛집': 'restaurant-outline',
    '놀거리': 'game-controller-outline',
    '문화/관광': 'map-outline',
    '카페': 'cafe-outline'
};

export default function PlaceCard({ item, onPress, onToggleSave, isSaved }) {
    const tags = item.tags || [];

    // ✅ [수정] Google API 및 item.image 관련 로직 모두 제거
    // const imageUrl = item.image || null;

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
            {/* ✅ 이미지 View 제거 */}

            <View style={styles.infoContainer}>
                <View style={styles.header}>
                    <Ionicons
                        name={categoryIcons[item.mainCategory] || 'location-outline'}
                        size={16}
                        color="#888"
                        style={styles.categoryIcon}
                    />
                    <Text style={styles.placeName} numberOfLines={1}>{item.name}</Text>
                    {item.distance != null && <Text style={styles.distanceText}>{item.distance.toFixed(1)}km</Text>}
                </View>
                <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                <View style={styles.tagsContainer}>
                    {tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={() => onToggleSave(item)}>
                <Ionicons name={isSaved ? "heart" : "heart-outline"} size={24} color={isSaved ? "#FF7A00" : "#ccc"} />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

// ✅ [수정] 이미지 없는 UI에 맞게 스타일 변경
const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginVertical: 8,
        marginHorizontal: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    infoContainer: {
        flex: 1,
        padding: 12,
        paddingRight: 40, // 하트 버튼 공간 확보
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    categoryIcon: {
        marginRight: 6,
    },
    placeName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        flexShrink: 1,
        marginRight: 8,
    },
    distanceText: {
        fontSize: 13,
        color: '#FF7A00',
        fontWeight: 'bold',
        marginLeft: 'auto',
    },
    addressText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingVertical: 3,
        paddingHorizontal: 8,
        marginRight: 5,
        marginTop: 4,
    },
    tagText: {
        color: '#555',
        fontSize: 11,
    },
    saveButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
    },
});

