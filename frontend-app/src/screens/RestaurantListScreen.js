import React, { useState, useEffect, useContext } from 'react'; // useContext 추가
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PlaceCard from '../components/PlaceCard';
import { getDistance } from '../utils/distance';
import { PlacesContext } from '../contexts/PlacesContext'; // Context import 추가

// 정렬 옵션 정의
const SORT_OPTIONS = [
    { id: 'distance', title: '가까운 순' },
    { id: 'rating', title: '별점 높은 순' },
    { id: 'saved', title: '찜 많은 순' },
];

export default function RestaurantListScreen({ route, navigation }) {
    // ✨ route.params에서는 '카테고리'와 '위치' 정보만 받습니다.
    const { category, userCity, userLocation } = route.params;

    // ✨ '저장' 관련 데이터와 함수는 Context에서 직접 가져옵니다.
    const { allPlaces, savedPlaces, onToggleSave } = useContext(PlacesContext);

    const [places, setPlaces] = useState([]);
    const [activeSort, setActiveSort] = useState('distance'); // 기본 정렬: 가까운 순

    useEffect(() => {
        let filteredPlaces = allPlaces.filter(place =>
            place.address && place.address.includes(userCity) &&
            place.tags && place.tags.includes(category)
        );

        switch (activeSort) {
            case 'distance':
                filteredPlaces = filteredPlaces
                    .map(p => ({ ...p, distance: getDistance(userLocation.latitude, userLocation.longitude, p.coordinate.latitude, p.coordinate.longitude) }))
                    .sort((a, b) => a.distance - b.distance);
                break;
            case 'rating':
                filteredPlaces.sort((a, b) => b.rating - a.rating);
                break;
            case 'saved':
                filteredPlaces.sort((a, b) => b.reviews - a.reviews);
                break;
            default:
                break;
        }

        setPlaces(filteredPlaces);
    }, [category, userCity, userLocation, activeSort, allPlaces]); // allPlaces 의존성 추가

    const handlePlacePress = (place) => {
        navigation.navigate('홈', { selectedPlace: place });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{category}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.sortContainer}>
                {SORT_OPTIONS.map(option => (
                    <TouchableOpacity
                        key={option.id}
                        style={[styles.sortButton, activeSort === option.id && styles.activeSortButton]}
                        onPress={() => setActiveSort(option.id)}
                    >
                        <Text style={[styles.sortButtonText, activeSort === option.id && styles.activeSortButtonText]}>
                            {option.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {places.length > 0 ? (
                <FlatList
                    data={places}
                    renderItem={({ item }) => (
                        <PlaceCard
                            item={item}
                            onPress={() => handlePlacePress(item)}
                            isSaved={savedPlaces.some(p => p.id === item.id)}
                            onToggleSave={onToggleSave}
                        />
                    )}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingTop: 10 }}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>앗, 이 근처에는 결과가 없어요.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    backButton: { padding: 5 },
    sortContainer: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    sortButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
    activeSortButton: { backgroundColor: '#FFEBDA', borderWidth: 1, borderColor: '#FF7A00' },
    sortButtonText: { color: '#555', fontWeight: '500' },
    activeSortButtonText: { color: '#FF7A00', fontWeight: 'bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#555' },
});

