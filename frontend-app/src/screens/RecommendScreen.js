import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MAIN_CATEGORIES = [
    { id: '맛집', name: '맛집', icon: 'restaurant-outline' },
    { id: '놀거리', name: '놀거리', icon: 'game-controller-outline' },
    { id: '문화/관광', name: '문화/관광', icon: 'map-outline' },
    { id: '카페', name: '카페', icon: 'cafe-outline' },
];

export default function RecommendScreen({ navigation }) {

    const handleCategoryPress = (category) => {
        // ✅ PlaceListScreen으로 '어떤 대분류'를 선택했는지 ID를 넘겨줍니다.
        navigation.navigate('PlaceList', { mainCategory: category.id });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>카테고리</Text>
            </View>
            <FlatList
                data={MAIN_CATEGORIES}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.categoryButton} onPress={() => handleCategoryPress(item)}>
                        <Ionicons name={item.icon} size={40} color="#FF7A00" />
                        <Text style={styles.categoryText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.container}
            />
        </SafeAreaView>
    );
}

// 스타일은 이전 답변과 동일하게 유지
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: { paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    container: { padding: 15 },
    categoryButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 30, margin: 8, backgroundColor: '#f8f8f8', borderRadius: 15, borderWidth: 1, borderColor: '#f0f0f0' },
    categoryText: { marginTop: 15, fontSize: 16, fontWeight: '600' }
});