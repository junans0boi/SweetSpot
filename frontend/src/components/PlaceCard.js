import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PlaceCard({ item, onPress, onToggleSave, isSaved }) {
    // tags가 없는 경우를 대비한 안전장치
    const tags = item.tags || [];

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.infoContainer}>
                <View style={styles.header}>
                    <Text style={styles.placeName} numberOfLines={1}>{item.name}</Text>
                    {item.distance != null && <Text style={styles.distanceText}>{item.distance.toFixed(2)} km</Text>}
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
            {/* --- ✨ 찜(저장) 버튼 추가 --- */}
            <TouchableOpacity style={styles.saveButton} onPress={() => onToggleSave(item)}>
                <Ionicons
                    name={isSaved ? "heart" : "heart-outline"}
                    size={24}
                    color={isSaved ? "#FF7A00" : "#ccc"}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
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
    cardImage: {
        width: 100,
        height: '100%',
        borderTopLeftRadius: 14,
        borderBottomLeftRadius: 14,
    },
    infoContainer: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
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
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 15,
    },
});

