import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image'; 
import { Ionicons } from '@expo/vector-icons';

const categoryIcons = {
    '맛집': 'restaurant-outline',
    '놀거리': 'game-controller-outline',
    '문화/관광': 'map-outline',
    '카페': 'cafe-outline'
};

export default function PlaceCard({ item, onPress, onToggleSave, isSaved, containerStyle, showImage = true }) {
    if (!item) return null;

    const tags = item.tags || [];
    const displayTags = tags.slice(0, 3);

    let imageUrl = null;
    if (item.photoUrls && item.photoUrls.length > 0) {
        imageUrl = item.photoUrls[0];
    } else if (item.image) {
        imageUrl = item.image;
    }

    return (
        <TouchableOpacity 
            style={[styles.cardContainer, containerStyle]} 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.contentRow}>
                
                {/* showImage가 true일 때만 이미지 렌더링 */}
                {showImage && (
                    imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.thumbnail}
                            contentFit="cover"
                            transition={300}
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                             <Ionicons
                                name={categoryIcons[item.mainCategory] || 'location-outline'}
                                size={30}
                                color="#ccc"
                            />
                        </View>
                    )
                )}

                {/* 정보 영역 */}
                <View style={[styles.infoContainer, !showImage && { marginLeft: 0 }]}> 
                    <View style={styles.header}>
                        <Text style={styles.placeName} numberOfLines={1} ellipsizeMode="tail">
                            {item.name}
                        </Text>
                        {item.distanceText && (
                            <Text style={styles.distanceText}>{item.distanceText}</Text>
                        )}
                    </View>
                    
                    <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                    
                    <View style={styles.tagsContainer}>
                        {displayTags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>#{tag}</Text>
                            </View>
                        ))}
                        {displayTags.length === 0 && (
                            <View style={styles.categoryTag}>
                                <Text style={styles.categoryTagText}>{item.mainCategory}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {onToggleSave && (
                <TouchableOpacity style={styles.saveButton} onPress={() => onToggleSave(item)}>
                    <Ionicons name={isSaved ? "heart" : "heart-outline"} size={24} color={isSaved ? "#FF7A00" : "#ccc"} />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 6,
        marginHorizontal: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        overflow: 'hidden',
        // ❌ width: '100%' 삭제! (이게 원인이었습니다)
    },
    contentRow: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
    },
    thumbnail: {
        width: 85,
        height: 85,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    placeholderImage: {
        width: 85,
        height: 85,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
        paddingRight: 20, 
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    placeName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        flex: 1, // 이름이 길어지면 줄어들도록
        marginRight: 8,
    },
    distanceText: {
        fontSize: 13,
        color: '#FF7A00',
        fontWeight: '600',
    },
    addressText: {
        fontSize: 13,
        color: '#777',
        marginBottom: 10,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    tag: {
        backgroundColor: '#F2F4F6',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 4,
    },
    tagText: {
        color: '#4E5968',
        fontSize: 11,
        fontWeight: '500',
    },
    categoryTag: {
        backgroundColor: '#FFF0E6',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    categoryTagText: {
        fontSize: 11,
        color: '#FF7A00',
        fontWeight: 'bold',
    },
    saveButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        padding: 5,
    },
});