import React, { useState, useEffect, useRef, useContext, useMemo } from 'react'; // ✅ useMemo 추가
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, Platform, TextInput, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { PlacesContext } from '../contexts/PlacesContext';
import Header from '../components/Header';
import { openNaverMapDirections } from '../utils/navigationUtils';
import TodayRecommendation from '../components/TodayRecommendation';

// 홈 화면용 카테고리 데이터
const HOME_CATEGORIES = [
    { id: '맛집', name: '맛집', icon: 'restaurant-outline' },
    { id: '카페', name: '카페·디저트', icon: 'cafe-outline' },
    { id: '놀거리', name: '놀거리', icon: 'game-controller-outline' },
    { id: '문화/관광', name: '문화/관광', icon: 'map-outline' },
    { id: '여행', name: '여행', icon: 'map-outline' },
];

// 홈 화면용 카테고리 버튼 UI
const CategoryButtons = ({ navigation }) => (
    <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>카테고리</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {HOME_CATEGORIES.map(cat => (
                <TouchableOpacity key={cat.id} style={styles.categoryButton} onPress={() => navigation.navigate('추천', { screen: 'PlaceList', params: { mainCategory: cat.id } })}>
                    <View style={styles.categoryIconBg}><Ionicons name={cat.icon} size={28} color="#555" /></View>
                    <Text style={styles.categoryText}>{cat.name}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
        <TouchableOpacity style={styles.categoryMoreButton} onPress={() => navigation.navigate('추천')}>
            <Text style={styles.categoryMoreText}>카테고리에서 더보기</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#888" />
        </TouchableOpacity>
    </View>
);

export default function HomeScreen({ route, navigation }) {
    const { userLocation, userCity, allPlaces, refreshPlaces, setUserLocation, setUserCity } = useContext(PlacesContext);

    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isMapExpanded, setMapExpanded] = useState(false);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [locationSearchQuery, setLocationSearchQuery] = useState('');
    const [locationResults, setLocationResults] = useState([]);
    const [isLocationLoading, setIsLocationLoading] = useState(false);

    const mapViewRef = useRef(null);

    // ✅ [핵심 수정] 성능 최적화를 위해 마커 개수를 30개로 제한
    // 실제 서비스에서는 '화면 영역 내' 데이터만 보여주는 클러스터링이 필요하지만,
    // 지금은 3000개 데이터를 다 뿌리면 앱이 죽으므로 잘라서 보여줍니다.
    const displayedPlaces = useMemo(() => {
        return allPlaces.slice(0, 30); 
    }, [allPlaces]);

    const handlePlacePress = (place) => {
        setSelectedPlace(place);
        if (mapViewRef.current) {
            mapViewRef.current.animateToRegion({
                latitude: place.lat,
                longitude: place.lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005
            }, 500);
        }
    };

    const goToDetail = (place) => {
        navigation.navigate('PlaceDetail', { place });
    };

    const goToMyLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { latitude, longitude } = loc.coords;

        if (mapViewRef.current) {
            mapViewRef.current.animateToRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
        }
        
        setUserLocation(loc.coords);
        refreshPlaces(); 
    };

    // 검색 관련 함수 (임시 유지)
    const searchLocations = async (text) => { setLocationSearchQuery(text); };
    const fetchCurrentLocation = async () => { 
        await goToMyLocation(); 
        setLocationModalVisible(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            if (route.params?.selectedPlace) {
                const place = route.params.selectedPlace;
                setSelectedPlace(place);
                setMapExpanded(false);
                if (mapViewRef.current) {
                    mapViewRef.current.animateToRegion({ 
                        latitude: place.lat,
                        longitude: place.lng,
                        latitudeDelta: 0.005, 
                        longitudeDelta: 0.005 
                    }, 1000);
                }
                navigation.setParams({ selectedPlace: null });
            }
        }, [route.params?.selectedPlace])
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header
                userCity={userCity}
                onLocationPress={() => setLocationModalVisible(true)}
                onSearchPress={() => { }}
            />
            <View style={styles.container}>
                <MapView
                    ref={mapViewRef}
                    style={StyleSheet.absoluteFill}
                    initialRegion={{
                        latitude: userLocation ? userLocation.latitude : 37.5665,
                        longitude: userLocation ? userLocation.longitude : 126.9780,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    onPress={() => setSelectedPlace(null)}
                >
                    {/* ✅ [수정] 3500개 대신 제한된 개수(displayedPlaces)만 렌더링 */}
                    {displayedPlaces.map((place) => (
                        <Marker
                            key={place.id}
                            coordinate={{
                                latitude: place.lat,
                                longitude: place.lng
                            }}
                            onPress={() => handlePlacePress(place)}
                            tracksViewChanges={false} // ✅ [최적화] 깜빡임 및 성능 저하 방지
                        >
                            <View style={styles.markerShadow}>
                                <Ionicons 
                                    name="location" 
                                    size={40} 
                                    color={selectedPlace?.id === place.id ? "#FF4500" : "#FF7A00"} 
                                />
                            </View>
                            <Callout tooltip>
                                <View style={styles.calloutContainer}>
                                    <Text style={styles.calloutTitle}>{place.name}</Text>
                                    <Text style={styles.calloutSub}>{place.mainCategory}</Text>
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>

                {isMapExpanded ? (
                    <TouchableOpacity style={styles.showListButton} onPress={() => setMapExpanded(false)}>
                        <Ionicons name="list-outline" size={24} color="#333" />
                        <Text style={styles.showListButtonText}>목록 보기</Text>
                    </TouchableOpacity>
                ) : (
                    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
                        {/* 지도 터치 영역 (리스트 위 투명 공간) */}
                        <TouchableOpacity style={styles.mapTouchableArea} activeOpacity={1} onPress={() => setMapExpanded(true)} />
                        
                        <View style={styles.contentContainer}>
                            <CategoryButtons navigation={navigation} />
                            <View style={styles.divider} />
                            <TodayRecommendation />
                        </View>
                    </ScrollView>
                )}

                <TouchableOpacity style={[styles.myLocationButton, isMapExpanded && { bottom: 80 }]} onPress={goToMyLocation}>
                    <Ionicons name="navigate-outline" size={26} color="#333" />
                </TouchableOpacity>

                {selectedPlace && (
                    <View style={styles.floatingButtonContainer}>
                         <TouchableOpacity 
                            style={[styles.directionsButton, { backgroundColor: '#fff', marginRight: 10, borderWidth:1, borderColor:'#eee' }]} 
                            onPress={() => goToDetail(selectedPlace)}
                        >
                            <Text style={[styles.directionsButtonText, { color: '#333' }]}>상세보기</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.directionsButton} 
                            onPress={() => openNaverMapDirections(selectedPlace.lat, selectedPlace.lng, selectedPlace.name)}
                        >
                            <Ionicons name="navigate-circle-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.directionsButtonText}>길찾기</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 위치 설정 모달 */}
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
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="예: 산본역, 강남역"
                                    value={locationSearchQuery}
                                    onChangeText={searchLocations}
                                />
                            </View>
                            <TouchableOpacity style={{alignItems:'center', marginTop:15}} onPress={() => setLocationModalVisible(false)}>
                                <Text style={{color:'#888'}}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    contentScrollView: { flex: 1 },
    mapTouchableArea: { height: 350 }, // 이 높이만큼 지도가 보입니다
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
    
    markerShadow: { 
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 
    },
    calloutContainer: { 
        backgroundColor: '#fff', borderRadius: 10, padding: 12, elevation: 6, minWidth: 120, alignItems: 'center' 
    },
    calloutTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
    calloutSub: { fontSize: 12, color: '#888' },

    floatingButtonContainer: { 
        position: 'absolute', bottom: 30, left: 0, right: 0, 
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center' 
    },
    directionsButton: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#00C73C', 
        paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, elevation: 5 
    },
    directionsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

    // 모달 스타일
    locationModalKeyboardAvoidingView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
    fullScreenOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
    locationModalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '90%' },
    locationModalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    currentLocationButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFEBDA', paddingVertical: 12, borderRadius: 10, marginBottom: 15 },
    currentLocationButtonText: { color: '#FF7A00', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 15, marginBottom: 10 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 45, fontSize: 16 },
});