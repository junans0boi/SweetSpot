import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, Platform, TextInput, FlatList, ActivityIndicator, Alert, Dimensions } from 'react-native';
import ClusteredMapView from 'react-native-map-clustering';
import { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { PlacesContext } from '../contexts/PlacesContext';
import Header from '../components/Header';
import { openNaverMapDirections } from '../utils/navigationUtils';
import TodayRecommendation from '../components/TodayRecommendation';
import PlaceCard from '../components/PlaceCard';
import { getDistance, formatDistance } from '../utils/distance';

// ✅ 분리한 컴포넌트 임포트
import SweetPickModal from '../components/SweetPickModal';

// ... (상수 및 CategoryButtons 기존 유지) ...
const HOME_CATEGORIES = [
    { id: '맛집', name: '맛집', icon: 'restaurant-outline' },
    { id: '카페', name: '카페·디저트', icon: 'cafe-outline' },
    { id: '놀거리', name: '놀거리', icon: 'game-controller-outline' },
    { id: '문화/관광', name: '문화/관광', icon: 'map-outline' },
    { id: '여행', name: '여행', icon: 'map-outline' },
];

const CategoryButtons = ({ onCategoryPress }) => (
    <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>카테고리</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {HOME_CATEGORIES.map(cat => (
                <TouchableOpacity key={cat.id} style={styles.categoryButton} onPress={() => onCategoryPress(cat.id, cat.name)}>
                    <View style={styles.categoryIconBg}><Ionicons name={cat.icon} size={28} color="#555" /></View>
                    <Text style={styles.categoryText}>{cat.name}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);

export default function HomeScreen({ route, navigation }) {
    const { userLocation, userCity, allPlaces, refreshPlaces, setUserLocation, setUserCity, savedPlaces, onToggleSave } = useContext(PlacesContext);

    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isMapExpanded, setMapExpanded] = useState(false);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [locationSearchQuery, setLocationSearchQuery] = useState('');

    const [clusterModalVisible, setClusterModalVisible] = useState(false);
    const [clusterItems, setClusterItems] = useState([]);
    const [activeModalCategory, setActiveModalCategory] = useState('전체');
    const [clusterSearchQuery, setClusterSearchQuery] = useState('');
    const [sortType, setSortType] = useState('distance');

    const [showSearchButton, setShowSearchButton] = useState(false);
    const [mapRegion, setMapRegion] = useState(null);

    // 🍬 Sweet Pick 모달 상태
    const [isSweetPickModalVisible, setSweetPickModalVisible] = useState(false);

    const mapViewRef = useRef(null);
    
    // ✅ [신규] 카테고리 리스트 모달 상태
    const [categoryListModalVisible, setCategoryListModalVisible] = useState(false);
    const [selectedCategoryTitle, setSelectedCategoryTitle] = useState('');
    const [categoryListItems, setCategoryListItems] = useState([]);
    const [categorySortType, setCategorySortType] = useState('distance');

    // ... (handleCategoryPress, sortedCategoryListItems, ModalFilterAndSort 등 기존 로직 유지) ...
    // (여기서부터 기존 로직 복붙해서 사용하시면 됩니다. AI 관련 로직은 다 지우세요!)

    const handleCategoryPress = (categoryId, categoryName) => {
        let filtered = allPlaces.filter(p => p.mainCategory === categoryId);
        if (userLocation) {
            filtered = filtered.map(item => ({
                ...item,
                distanceVal: getDistance(userLocation.latitude, userLocation.longitude, item.lat, item.lng),
                distanceText: formatDistance(getDistance(userLocation.latitude, userLocation.longitude, item.lat, item.lng))
            }));
        }
        filtered.sort((a, b) => (a.distanceVal || 0) - (b.distanceVal || 0));
        setSelectedCategoryTitle(categoryName);
        setCategoryListItems(filtered);
        setCategorySortType('distance');
        setCategoryListModalVisible(true);
    };

    const sortedCategoryListItems = useMemo(() => {
        let items = [...categoryListItems];
        if (categorySortType === 'distance') {
            items.sort((a, b) => (a.distanceVal || 0) - (b.distanceVal || 0));
        } else if (categorySortType === 'rating') {
            items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
        return items;
    }, [categoryListItems, categorySortType]);

    const mapMarkers = useMemo(() => {
        return allPlaces.map((place) => (
            <Marker
                key={place.id}
                identifier={String(place.id)}
                coordinate={{ latitude: place.lat, longitude: place.lng }}
                onPress={() => handlePlacePress(place)}
                tracksViewChanges={false}
            >
                <View style={styles.markerShadow}>
                    <Ionicons name="location" size={40} color={selectedPlace?.id === place.id ? "#FF4500" : "#FF7A00"} />
                </View>
            </Marker>
        ));
    }, [allPlaces, selectedPlace]);

    // ... (filteredClusterItems, ModalFilterAndSort, handleClusterPress, handlePlacePress, goToDetail, onRegionChangeComplete, handleReSearch, goToMyLocation, fetchCurrentLocation, searchLocations, useFocusEffect) ...
    // (이 함수들은 기존 HomeScreen에 있던 그대로 두세요)
    
    const filteredClusterItems = useMemo(() => {
        let items = [...clusterItems];
        const query = clusterSearchQuery.toLowerCase().trim();
        if (activeModalCategory !== '전체') items = items.filter(item => item.mainCategory === activeModalCategory);
        if (query) items = items.filter(item => item.name.toLowerCase().includes(query) || item.address.toLowerCase().includes(query));
        
        items.sort((a, b) => {
            if (sortType === 'distance' && userLocation) {
                const distA = getDistance(userLocation.latitude, userLocation.longitude, a.lat, a.lng);
                const distB = getDistance(userLocation.latitude, userLocation.longitude, b.lat, b.lng);
                return distA - distB;
            } else if (sortType === 'rating') {
                return (b.rating || 0) - (a.rating || 0);
            }
            return 0;
        });
        if (userLocation) {
            items = items.map(item => ({
                ...item,
                distanceText: formatDistance(getDistance(userLocation.latitude, userLocation.longitude, item.lat, item.lng))
            }));
        }
        return items;
    }, [clusterItems, activeModalCategory, clusterSearchQuery, sortType, userLocation]);

    const ModalFilterAndSort = () => (
        <View style={styles.modalFilterContainer}>
            <View style={styles.sortButtonsRow}>
                <TouchableOpacity onPress={() => setSortType('distance')} style={styles.sortButton}>
                    <Text style={[styles.sortText, sortType === 'distance' && styles.sortTextActive]}>가까운순</Text>
                </TouchableOpacity>
                <View style={styles.verticalDivider} />
                <TouchableOpacity onPress={() => setSortType('rating')} style={styles.sortButton}>
                    <Text style={[styles.sortText, sortType === 'rating' && styles.sortTextActive]}>별점순</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                <TouchableOpacity style={[styles.modalFilterButton, activeModalCategory === '전체' && styles.modalFilterButtonActive]} onPress={() => setActiveModalCategory('전체')}>
                    <Text style={[styles.modalFilterText, activeModalCategory === '전체' && styles.modalFilterTextActive]}>전체</Text>
                </TouchableOpacity>
                {HOME_CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat.id} style={[styles.modalFilterButton, activeModalCategory === cat.id && styles.modalFilterButtonActive]} onPress={() => setActiveModalCategory(cat.id)}>
                        <Text style={[styles.modalFilterText, activeModalCategory === cat.id && styles.modalFilterTextActive]}>{cat.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const handleClusterPress = (cluster, markers) => {
        const placeIds = markers.map(m => {
            if (m.properties && m.properties.identifier) return m.properties.identifier;
            if (m.identifier) return m.identifier;
            if (m.props && m.props.identifier) return m.props.identifier;
            return null;
        }).filter(id => id !== null);
        const items = allPlaces.filter(p => placeIds.includes(String(p.id)));
        if (items.length > 0) {
            setClusterItems(items);
            setActiveModalCategory('전체');
            setClusterSearchQuery('');
            setSortType('distance');
            setClusterModalVisible(true);
            return true;
        }
        return false;
    };

    const handlePlacePress = (place) => { setSelectedPlace(place); };
    const goToDetail = (place) => { 
        setClusterModalVisible(false); 
        setCategoryListModalVisible(false);
        // AI 모달 닫기는 SweetPickModal 내부에서 처리하거나 여기서도 닫아줄 수 있음
        setSweetPickModalVisible(false);
        navigation.navigate('PlaceDetail', { place }); 
    };
    const onRegionChangeComplete = (region) => {
        setMapRegion(region);
        if (userLocation) {
            if (Math.abs(region.latitude - userLocation.latitude) > 0.01 || Math.abs(region.longitude - userLocation.longitude) > 0.01) setShowSearchButton(true);
        }
    };
    const handleReSearch = () => {
        if (mapRegion) {
            setShowSearchButton(false);
            setUserLocation({ latitude: mapRegion.latitude, longitude: mapRegion.longitude });
            refreshPlaces();
        }
    };
    const goToMyLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (mapViewRef.current) mapViewRef.current.animateToRegion({ ...loc.coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
        setUserLocation(loc.coords);
        setShowSearchButton(false);
        refreshPlaces();
    };
    const fetchCurrentLocation = async () => { await goToMyLocation(); setLocationModalVisible(false); };
    const searchLocations = (text) => setLocationSearchQuery(text);

    useFocusEffect(
        React.useCallback(() => {
            if (route.params?.selectedPlace) {
                const place = route.params.selectedPlace;
                setSelectedPlace(place);
                setMapExpanded(false);
                if (mapViewRef.current) mapViewRef.current.animateToRegion({ latitude: place.lat, longitude: place.lng, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 1000);
                navigation.setParams({ selectedPlace: null });
            }
        }, [route.params?.selectedPlace])
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header userCity={userCity} onLocationPress={() => setLocationModalVisible(true)} onSearchPress={() => { }} />
            <View style={styles.container}>
                {/* 지도 */}
                <ClusteredMapView
                    ref={mapViewRef} style={StyleSheet.absoluteFill}
                    initialRegion={{ latitude: userLocation ? userLocation.latitude : 37.5665, longitude: userLocation ? userLocation.longitude : 126.9780, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                    showsUserLocation={true} showsMyLocationButton={false} onPress={() => setSelectedPlace(null)} onRegionChangeComplete={onRegionChangeComplete}
                    clusterColor="#FF7A00" clusterTextColor="#FFFFFF" clusterRadius={30} preserveClusterPressBehavior={false} onClusterPress={handleClusterPress} animationEnabled={true}
                >
                    {mapMarkers}
                </ClusteredMapView>

                {/* 재검색 버튼 */}
                {showSearchButton && (
                    <TouchableOpacity style={styles.reSearchButton} onPress={handleReSearch}>
                        <Text style={styles.reSearchText}>이 지역에서 재검색</Text>
                        <Ionicons name="refresh" size={16} color="#FF7A00" style={{ marginLeft: 5 }} />
                    </TouchableOpacity>
                )}

                {/* 하단 목록/내용 */}
                {isMapExpanded ? (
                    <TouchableOpacity style={styles.showListButton} onPress={() => setMapExpanded(false)}>
                        <Ionicons name="list-outline" size={24} color="#333" />
                        <Text style={styles.showListButtonText}>목록 보기</Text>
                    </TouchableOpacity>
                ) : (
                    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
                        <TouchableOpacity style={styles.mapTouchableArea} activeOpacity={1} onPress={() => setMapExpanded(true)} />
                        <View style={styles.contentContainer}>
                            <CategoryButtons onCategoryPress={handleCategoryPress} />
                            <View style={styles.divider} />
                            <TodayRecommendation />
                        </View>
                    </ScrollView>
                )}

                <TouchableOpacity style={[styles.myLocationButton, isMapExpanded && { bottom: 80 }]} onPress={goToMyLocation}>
                    <Ionicons name="navigate-outline" size={26} color="#333" />
                </TouchableOpacity>

                {/* 선택된 장소 플로팅 버튼 */}
                {selectedPlace && !clusterModalVisible && !categoryListModalVisible && (
                    <View style={styles.floatingButtonContainer}>
                        <TouchableOpacity style={[styles.directionsButton, { backgroundColor: '#fff', marginRight: 10, borderWidth: 1, borderColor: '#eee' }]} onPress={() => goToDetail(selectedPlace)}>
                            <Text style={[styles.directionsButtonText, { color: '#333' }]}>상세보기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.directionsButton} onPress={() => openNaverMapDirections(selectedPlace.lat, selectedPlace.lng, selectedPlace.name)}>
                            <Ionicons name="navigate-circle-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.directionsButtonText}>길찾기</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 모달들 */}
                {/* 1. 카테고리 리스트 모달 */}
                <Modal visible={categoryListModalVisible} transparent={true} animationType="slide" onRequestClose={() => setCategoryListModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => setCategoryListModalVisible(false)} activeOpacity={1} />
                        <View style={styles.clusterModalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{selectedCategoryTitle} <Text style={styles.modalSubTitle}>({categoryListItems.length}개)</Text></Text>
                                <TouchableOpacity onPress={() => setCategoryListModalVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
                            </View>
                            <View style={styles.sortButtonsRow}>
                                <TouchableOpacity onPress={() => setCategorySortType('distance')} style={styles.sortButton}>
                                    <Text style={[styles.sortText, categorySortType === 'distance' && styles.sortTextActive]}>가까운순</Text>
                                </TouchableOpacity>
                                <View style={styles.verticalDivider} />
                                <TouchableOpacity onPress={() => setCategorySortType('rating')} style={styles.sortButton}>
                                    <Text style={[styles.sortText, categorySortType === 'rating' && styles.sortTextActive]}>별점순</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={sortedCategoryListItems} 
                                keyExtractor={item => String(item.id)}
                                renderItem={({ item }) => (
                                    <PlaceCard 
                                        item={item} 
                                        onPress={() => goToDetail(item)} 
                                        isSaved={savedPlaces.some(p => p.id === item.id)} 
                                        onToggleSave={onToggleSave} 
                                        containerStyle={{ marginHorizontal: 0, width: '100%', marginBottom: 12 }} 
                                    />
                                )}
                                style={{ maxHeight: 450 }}
                                ListEmptyComponent={<View style={styles.emptyFilterContainer}><Text style={styles.emptyFilterText}>근처에 해당 카테고리의 장소가 없어요.</Text></View>}
                            />
                        </View>
                    </View>
                </Modal>

                {/* 2. 클러스터 모달 */}
                <Modal visible={clusterModalVisible} transparent={true} animationType="slide" onRequestClose={() => setClusterModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => setClusterModalVisible(false)} activeOpacity={1} />
                        <View style={styles.clusterModalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>이 지역 {filteredClusterItems.length}곳 <Text style={styles.modalSubTitle}> (전체 {clusterItems.length})</Text></Text>
                                <TouchableOpacity onPress={() => setClusterModalVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
                            </View>
                            <View style={styles.modalSearchBar}>
                                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                                <TextInput style={styles.modalSearchInput} placeholder="매장 이름이나 주소 검색" value={clusterSearchQuery} onChangeText={setClusterSearchQuery} />
                                {clusterSearchQuery.length > 0 && (<TouchableOpacity onPress={() => setClusterSearchQuery('')} style={styles.clearSearchButton}><Ionicons name="close-circle" size={20} color="#888" /></TouchableOpacity>)}
                            </View>
                            <ModalFilterAndSort />
                            <FlatList
                                data={filteredClusterItems} keyExtractor={item => String(item.id)}
                                renderItem={({ item }) => <PlaceCard item={item} onPress={() => goToDetail(item)} isSaved={savedPlaces.some(p => p.id === item.id)} onToggleSave={onToggleSave} />}
                                style={{ maxHeight: 400 }}
                                ListEmptyComponent={<View style={styles.emptyFilterContainer}><Text style={styles.emptyFilterText}>{clusterSearchQuery.length > 0 ? `"${clusterSearchQuery}"에 해당하는 장소가 없습니다.` : `해당 카테고리의 장소가 없습니다.`}</Text></View>}
                            />
                        </View>
                    </View>
                </Modal>

                {/* 3. 위치 설정 모달 */}
                <Modal visible={locationModalVisible} transparent={true} animationType="fade" onRequestClose={() => setLocationModalVisible(false)}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.locationModalKeyboardAvoidingView}>
                        <TouchableOpacity style={styles.fullScreenOverlay} activeOpacity={1} onPress={() => setLocationModalVisible(false)} />
                        <View style={styles.locationModalContent}>
                            <Text style={styles.locationModalTitle}>위치 설정</Text>
                            <TouchableOpacity style={styles.currentLocationButton} onPress={() => fetchCurrentLocation(true)}>
                                <Ionicons name="navigate-circle-outline" size={22} color="#FF7A00" />
                                <Text style={styles.currentLocationButtonText}>현재 위치로 설정</Text>
                            </TouchableOpacity>
                            <View style={styles.searchBar}>
                                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                                <TextInput style={styles.searchInput} placeholder="예: 산본역, 강남역" value={locationSearchQuery} onChangeText={searchLocations} />
                            </View>
                            <TouchableOpacity style={{ alignItems: 'center', marginTop: 15 }} onPress={() => setLocationModalVisible(false)}>
                                <Text style={{ color: '#888' }}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

                {/* Sweet Pick 버튼 */}
                <TouchableOpacity style={styles.sweetPickButton} onPress={() => setSweetPickModalVisible(true)}>
                    <View style={styles.sweetPickIconBg}>
                         <Text style={{ fontSize: 24 }}>🍬</Text>
                    </View>
                    <Text style={styles.sweetPickText}>AI 추천</Text>
                </TouchableOpacity>

                {/* ✅ 4. Sweet Pick 모달 (분리된 컴포넌트 사용) */}
                <SweetPickModal 
                    isVisible={isSweetPickModalVisible}
                    onClose={() => setSweetPickModalVisible(false)}
                    userLocation={userLocation}
                    savedPlaces={savedPlaces}
                    onToggleSave={onToggleSave}
                    navigation={navigation}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    contentScrollView: { flex: 1 },
    mapTouchableArea: { height: 350 },
    contentContainer: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, minHeight: 600 },
    categoryContainer: { marginBottom: 15 },
    categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    categoryTitle: { fontSize: 20, fontWeight: 'bold' },
    categoryButton: { alignItems: 'center', marginRight: 15, width: 70 },
    categoryIconBg: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
    categoryText: { marginTop: 8, fontSize: 13, fontWeight: '500' },
    categoryMoreButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderTopWidth: 1, borderTopColor: '#f0f0f0', marginTop: 15 },
    categoryMoreText: { color: '#555', fontWeight: '600', marginRight: 4 },
    divider: { height: 8, backgroundColor: '#f5f5f5' },
    myLocationButton: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#fff', borderRadius: 30, width: 50, height: 50, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    showListButton: { flexDirection: 'row', position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
    showListButtonText: { fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
    markerShadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
    calloutContainer: { backgroundColor: '#fff', borderRadius: 10, padding: 12, elevation: 6, minWidth: 120, alignItems: 'center' },
    calloutTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
    calloutSub: { fontSize: 12, color: '#888' },
    floatingButtonContainer: { position: 'absolute', bottom: 30, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    directionsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00C73C', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, elevation: 5 },
    directionsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
    reSearchButton: { position: 'absolute', top: 20, alignSelf: 'center', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3.84, zIndex: 10 },
    reSearchText: { color: '#FF7A00', fontWeight: 'bold', fontSize: 14 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    clusterModalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalSubTitle: { fontSize: 14, color: '#888', fontWeight: 'normal' },
    modalSearchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 15, marginBottom: 10 },
    modalSearchInput: { flex: 1, height: 45, fontSize: 16 },
    clearSearchButton: { marginLeft: 10 },
    modalFilterContainer: { marginBottom: 10 },
    modalFilterButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: '#f0f0f0', marginRight: 8 },
    modalFilterButtonActive: { backgroundColor: '#333' },
    modalFilterText: { color: '#555', fontSize: 13, fontWeight: '500' },
    modalFilterTextActive: { color: '#fff', fontWeight: 'bold' },
    emptyFilterContainer: { padding: 20, alignItems: 'center' },
    emptyFilterText: { color: '#888' },
    sortButtonsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    sortButton: { paddingHorizontal: 5 },
    sortText: { fontSize: 13, color: '#888' },
    sortTextActive: { color: '#333', fontWeight: 'bold' },
    verticalDivider: { width: 1, height: 12, backgroundColor: '#ddd', marginHorizontal: 10 },
    locationModalKeyboardAvoidingView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
    fullScreenOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
    locationModalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '90%' },
    locationModalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    currentLocationButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFEBDA', paddingVertical: 12, borderRadius: 10, marginBottom: 15 },
    currentLocationButtonText: { color: '#FF7A00', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 15, marginBottom: 10 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 45, fontSize: 16 },
    locationResultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    locationResultIcon: { marginRight: 15 },
    locationResultText: { fontSize: 16, flex: 1 },

    // Sweet Pick UI 스타일
    sweetPickButton: { position: 'absolute', bottom: 150, right: 20, backgroundColor: '#fff', borderRadius: 30, width: 60, height: 60, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, zIndex: 20 },
    sweetPickIconBg: { backgroundColor: '#fff', borderRadius: 30, width: 60, height: 60, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: "#FF7A00", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, borderWidth: 1, borderColor: '#f0f0f0' },
    sweetPickText: { fontSize: 10, fontWeight: 'bold', color: '#FF7A00', marginTop: -2 },
    
    // 모달 컨테이너 수정: 중앙 정렬, 높이 제한 등 (삭제 - 이제 SweetPickModal.js에서 관리)
});