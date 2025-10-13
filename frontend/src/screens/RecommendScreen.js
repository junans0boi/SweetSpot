import React, { useContext } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlacesContext } from '../contexts/PlacesContext';

const FOOD_CATEGORIES = [
    { name: '한식', tag: '한식', icon: 'restaurant-outline' },
    { name: '중식', tag: '중식', icon: 'flag-outline' },
    { name: '일식', tag: '일식', icon: 'fish-outline' },
    { name: '양식', tag: '양식', icon: 'pizza-outline' },
    { name: '치킨', tag: '치킨', icon: 'fast-food-outline' },
    { name: '고기', tag: '고기', icon: 'bonfire-outline' },
    { name: '분식', tag: '분식', icon: 'ice-cream-outline' },
    { name: '패스트푸드', tag: '패스트푸드', icon: 'fast-food' },
];

export default function RecommendScreen({ navigation }) {
    const { userCity, userLocation } = useContext(PlacesContext);

    const handleCategoryPress = (category) => {
        // ✨ savedPlaces와 onToggleSave를 더 이상 전달하지 않습니다.
        navigation.navigate('RestaurantList', {
            category: category.tag,
            userCity,
            userLocation,
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>카테고리별 추천</Text>
            </View>
            <FlatList
                data={FOOD_CATEGORIES}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.categoryButton} onPress={() => handleCategoryPress(item)}>
                        <Ionicons name={item.icon} size={36} color="#FF7A00" />
                        <Text style={styles.categoryText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.tag}
                numColumns={4}
                contentContainerStyle={styles.container}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: { paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    container: { padding: 10 },
    categoryButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 20, margin: 5, backgroundColor: '#f8f8f8', borderRadius: 10 },
    categoryText: { marginTop: 10, fontSize: 14, fontWeight: '500' }
});

