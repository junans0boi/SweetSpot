import React, { useState, useMemo, useContext } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image'; // ✅ expo-image 사용
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CATEGORIES_DATA } from '../data/categories';
import PlaceCard from '../components/PlaceCard';
import { PlacesContext } from '../contexts/PlacesContext';

// 아이콘 렌더링 헬퍼
const DynamicIcon = ({ name, size, color }) => {
    const materialIcons = ['rice', 'food-drumstick', 'pot-steam', 'baguette'];
    if (materialIcons.includes(name)) {
        return <MaterialCommunityIcons name={name} size={size} color={color} />;
    }
    return <Ionicons name={name} size={size} color={color} />;
};

// 상단 추천 배너 (내부 컴포넌트)
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

// 세부 카테고리 필터 UI
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

// 정렬 버튼 UI
const SortButtons = ({ activeSort, onSelectSort }) => {
    const SORT_OPTIONS = [ { id: 'distance', title: '가까운 순'}, { id: 'rating', title: '별점 높은 순'}, { id: 'saved', title: '찜 많은 순'} ];
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

// 전체보기 모달
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

// --- 메인 화면 컴포넌트 ---
export default function PlaceListScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { mainCategory } = route.params;

    const categoryInfo = CATEGORIES_DATA[mainCategory] || { title: '목록', sub: [] };
    const subCategories = categoryInfo.sub;

    const [activeSubCategory, setActiveSubCategory] = useState('전체');
    const [activeSort, setActiveSort] = useState('distance');
    const [isModalVisible, setModalVisible] = useState(false);

    // ✅ [수정] useContext에서 allPlaces를 반드시 가져와야 함 (이 부분이 에러 원인이었음)
    const { allPlaces, savedPlaces, onToggleSave } = useContext(PlacesContext);

    const filteredPlaces = useMemo(() => {
        // 1. 대분류 필터링 (안전장치 추가)
        const places = allPlaces ? allPlaces : [];
        const basePlaces = places.filter(p => p.mainCategory === mainCategory);

        // 2. 소분류 필터링 (전체 선택 시 모두 반환)
        if (activeSubCategory === '전체') {
            return basePlaces;
        }
        
        // ✅ [수정] tags가 아니라 subCategory와 정확히 비교
        return basePlaces.filter(p => p.subCategory === activeSubCategory);
        
    }, [activeSubCategory, activeSort, allPlaces, mainCategory]);

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
                renderItem={({ item }) => ( 
                    <PlaceCard 
                        item={item} 
                        onPress={() => navigation.navigate('PlaceDetail', { place: item })} 
                        isSaved={savedPlaces.some(p => p.id === item.id)} 
                        onToggleSave={onToggleSave} 
                    /> 
                )}
                keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={() => ( 
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>앗, 이 근처에는 결과가 없어요.</Text>
                    </View> 
                )}
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