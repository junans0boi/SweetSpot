import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image'; // ✅ expo-image 사용

const TodayRecommendation = () => {
    const DUMMY_RECOMMENDATIONS = [
        { id: 1, name: '또래오래', discount: '최대 5,000원 할인', image: 'https://picsum.photos/seed/toreore/400/300' },
        { id: 2, name: '네네치킨', discount: '최대 5,000원 할인', image: 'https://picsum.photos/seed/nene/400/300' },
        { id: 3, name: '후라이드참잘하는집', discount: '최대 4,000원 할인', image: 'https://picsum.photos/seed/hucham/400/300' },
    ];

    return (
        <View style={styles.recommendContainer}>
            <Text style={styles.recommendTitle}>오늘의 추천</Text>
            <Text style={styles.recommendSubTitle}>{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}을 기준으로 분위기에 맞게 추천 드려요!</Text>
            <FlatList
                horizontal
                data={DUMMY_RECOMMENDATIONS}
                keyExtractor={item => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 10 }}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.recommendCard}>
                        <Image source={{ uri: item.image }} style={styles.recommendImage} placeholder={'#e0e0e0'} transition={300} />
                        <Text style={styles.recommendCardTitle}>{item.name}</Text>
                        <Text style={styles.recommendCardDiscount}>{item.discount}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    recommendContainer: { paddingVertical: 20, backgroundColor: '#FFF9F2' },
    recommendTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 15 },
    recommendSubTitle: { fontSize: 13, color: '#888', paddingHorizontal: 15, marginTop: 4 },
    recommendCard: { marginRight: 12, width: 150 },
    recommendImage: { width: '100%', height: 100, borderRadius: 10, backgroundColor: '#eee' },
    recommendCardTitle: { fontSize: 15, fontWeight: '600', marginTop: 8 },
    recommendCardDiscount: { fontSize: 13, color: '#FF7A00', fontWeight: 'bold' },
});

export default TodayRecommendation;

