import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReviewCard({ review }) {
    return (
        <View style={styles.card}>
            <View style={styles.authorContainer}>
                <Text style={styles.authorName}>{review.authorName}</Text>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{review.rating.toFixed(1)}</Text>
                </View>
            </View>
            <Text style={styles.reviewText}>{review.text}</Text>
            {review.photoUrls && review.photoUrls.length > 0 && (
                <FlatList
                    data={review.photoUrls}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Image source={{ uri: item }} style={styles.reviewImage} />
                    )}
                    style={{ marginTop: 10 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eee'
    },
    authorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    authorName: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 5,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 13,
        fontWeight: 'bold',
    },
    reviewText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#444',
    },
    reviewImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
    },
});

