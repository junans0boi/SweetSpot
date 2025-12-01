import React, { useState, useMemo, useContext } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { CATEGORIES_DATA } from '../data/categories';
import PlaceCard from '../components/PlaceCard';
import { PlacesContext } from '../contexts/PlacesContext';
import { getDistance } from '../utils/distance'; 

// ... (DynamicIcon, FixedTodayRecommendation, SubCategoryFilter, SortButtons, AllCategoriesView 컴포넌트들은 기존 코드 유지) ...
const DynamicIcon = ({ name, size, color }) => {
    const materialIcons = ['rice', 'food-drumstick', 'pot-steam', 'baguette'];
    if (materialIcons.includes(name)) {
        return <MaterialCommunityIcons name={name} size={size} color={color} />;
    }
    return <Ionicons name={name} size={size} color={color} />;
};

const FixedTodayRecommendation = () => {
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

const SubCategoryFilter = ({ categories, activeCategory, onSelect, onShowAll, isVisible }) => (
    <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 15, flexGrow: 1 }}>
            {categories.slice(0, 5).map(cat => (
                <TouchableOpacity key={cat.tag} style={styles.filterButton} onPress={() => onSelect(cat.tag)}>
                    <DynamicIcon name={cat.icon} size={28} color={activeCategory === cat.tag ? '#333' : '#888'} />
                    <Text style={[styles.filterText, activeCategory === cat.tag && styles.activeFilterText]}>{cat.name}</Text>
                    {activeCategory === cat.tag && <View style={styles.activeLine} />}
                </TouchableOpacity>
            ))}
        </ScrollView>
        <TouchableOpacity style={styles.showAllButton} onPress={onShowAll}>
            <View style={styles.showAllIconBg}>
                <Ionicons name={isVisible ? "chevron-up" : "chevron-down"} size={20} color="#555" />
            </View>
        </TouchableOpacity>
    </View>
);

const SortButtons = ({ activeSort, onSelectSort }) => {
    const SORT_OPTIONS = [ { id: 'distance', title: '가까운 순'}, { id: 'rating', title: '별점 높은 순'} ];
    return (
        <View style={styles.sortContainer}>
            {SORT_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.id} style={[styles.sortButton, activeSort === opt.id && styles.activeSortButton]} onPress={() => onSelectSort(opt.id)}>
                    <Text style={[styles.sortText, activeSort === opt.id && styles.activeSortText]}>{opt.title}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const AllCategoriesView = ({ isVisible, onClose, categories, onSelect }) => {
    if (!isVisible) return null;
    return (
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>메뉴 전체보기</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="chevron-up" size={24} color="#555" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={categories}
                    keyExtractor={item => item.tag}
                    numColumns={5}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item.tag)}>
                            <View style={styles.modalItemIconBg}>
                                <DynamicIcon name={item.icon} size={26} color="#333" />
                            </View>
                            <Text style={styles.modalItemText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </TouchableOpacity>
    );
};

export default function PlaceListScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { mainCategory } = route.params;

    const categoryInfo = CATEGORIES_DATA[mainCategory] || { title: '목록', sub: [] };
    const subCategories = categoryInfo.sub;

    const [activeSubCategory, setActiveSubCategory] = useState('전체');
    const [activeSort, setActiveSort] = useState('distance');
    const [isModalVisible, setModalVisible] = useState(false);

    const { allPlaces, savedPlaces, onToggleSave, userLocation, refreshPlaces } = useContext(PlacesContext);

    // 화면 포커스 시 데이터 갱신 (리뷰 작성 후 평점 반영 등)
    useFocusEffect(
        React.useCallback(() => {
            refreshPlaces();
        }, [])
    );

    const filteredPlaces = useMemo(() => {
        if (!allPlaces) return [];

        let places = allPlaces.filter(p => p.mainCategory === mainCategory);

        if (activeSubCategory !== '전체') {
            places = places.filter(p => p.subCategory === activeSubCategory);
        }
        
        return [...places].sort((a, b) => {
            if (activeSort === 'distance' && userLocation) {
                const distA = getDistance(userLocation.latitude, userLocation.longitude, a.lat, a.lng);
                const distB = getDistance(userLocation.latitude, userLocation.longitude, b.lat, b.lng);
                return distA - distB;
            } else if (activeSort === 'rating') {
                return (b.rating || 0) - (a.rating || 0);
            }
            return 0;
        });
        
    }, [activeSubCategory, activeSort, allPlaces, mainCategory, userLocation]);

    const handleSelectCategory = (tag) => {
        setActiveSubCategory(tag);
        setModalVisible(false);
    };

    const ListHeader = () => (
        <>
            <FixedTodayRecommendation />
            <View style={{height: 8, backgroundColor: '#f0f0f0'}} />
            <SortButtons activeSort={activeSort} onSelectSort={setActiveSort} />
        </>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoryInfo.title}</Text>
            </View>

            <View style={{ zIndex: 10 }}>
                <SubCategoryFilter
                    categories={subCategories}
                    activeCategory={activeSubCategory}
                    onSelect={setActiveSubCategory}
                    onShowAll={() => setModalVisible(!isModalVisible)}
                    isVisible={isModalVisible}
                />
                <AllCategoriesView
                    isVisible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    categories={subCategories}
                    onSelect={handleSelectCategory}
                />
            </View>

            <FlatList
                data={filteredPlaces}
                keyExtractor={(item) => String(item.id)}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                renderItem={({ item }) => ( 
                    <PlaceCard 
                        item={item} 
                        onPress={() => navigation.navigate('PlaceDetail', { place: item })} 
                        isSaved={savedPlaces.some(p => p.id === item.id)} 
                        onToggleSave={onToggleSave} 
                        showImage={false} 
                    /> 
                )}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={() => ( 
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>조건에 맞는 장소가 없어요.</Text>
                    </View> 
                )}
                // ✅ [수정] contentContainerStyle 추가: 하단 여백 확보
                contentContainerStyle={{ paddingBottom: 20 }}
                // ✅ [수정] style 속성은 제거하거나 flex: 1을 줍니다. (maxHeight 제거)
                style={{ flex: 1 }} 
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
    backButton: { padding: 5, marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    filterContainer: { flexDirection: 'row', alignItems: 'stretch', borderBottomWidth: 1, borderBottomColor: '#f5f5f5', backgroundColor: '#fff' },
    filterButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 12, minWidth: 70 },
    activeLine: { position: 'absolute', bottom: 0, left: 12, right: 12, height: 3, backgroundColor: '#333', borderRadius: 2 },
    filterText: { marginTop: 6, color: '#888', fontWeight: '500', fontSize: 13 },
    activeFilterText: { color: '#333', fontWeight: 'bold' },
    showAllButton: { paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: '#f0f0f0' },
    showAllIconBg: { backgroundColor: '#f0f0f0', padding: 4, borderRadius: 10 },
    recommendContainer: { paddingVertical: 20, backgroundColor: '#FFF9F2' },
    recommendTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 15 },
    recommendSubTitle: { fontSize: 13, color: '#888', paddingHorizontal: 15, marginTop: 4 },
    recommendCard: { marginRight: 12, width: 150 },
    recommendImage: { width: '100%', height: 100, borderRadius: 10, backgroundColor: '#eee' },
    recommendCardTitle: { fontSize: 15, fontWeight: '600', marginTop: 8 },
    recommendCardDiscount: { fontSize: 13, color: '#FF7A00', fontWeight: 'bold' },
    sortContainer: { flexDirection: 'row', padding: 15, backgroundColor: '#fff' },
    sortButton: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
    activeSortButton: { backgroundColor: '#333' },
    sortText: { color: '#555', fontWeight: '500', fontSize: 13 },
    activeSortText: { color: '#fff', fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 16, color: '#888' },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: '-1000%', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { backgroundColor: 'white', borderBottomLeftRadius: 15, borderBottomRightRadius: 15, paddingVertical: 10, paddingHorizontal: 5, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15 },
    modalTitle: { fontSize: 16, fontWeight: '600' },
    modalItem: { flex: 1, alignItems: 'center', paddingVertical: 10 },
    modalItemIconBg: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
    modalItemText: { marginTop: 8, fontSize: 12 },
});