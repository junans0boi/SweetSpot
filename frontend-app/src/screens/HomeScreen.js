import React, { useState, useEffect, useRef, useContext } from 'react';
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
    // ✅ 2. PlacesContext에서 allPlaces, onToggleSave 등 불필요한 것들 제거
    const { userLocation, userCity, GOOGLE_PLACES_API_KEY, setUserLocation, setUserCity } = useContext(PlacesContext);

    // ✅ 3. 예전 검색 모달 관련 상태 변수(modalVisible, selectedTag 등) 모두 제거
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isMapExpanded, setMapExpanded] = useState(false);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [locationSearchQuery, setLocationSearchQuery] = useState('');
    const [locationResults, setLocationResults] = useState([]);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    
    const mapViewRef = useRef(null);

    const handlePlacePress = (place) => navigation.navigate('PlaceDetail', { place });


    const goToMyLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (mapViewRef.current) {
            mapViewRef.current.animateToRegion({ ...location.coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
        }
    };

    const searchLocations = async (text) => {
        setLocationSearchQuery(text);
        if (text.length < 2) {
            setLocationResults([]);
            return;
        }
        setIsLocationLoading(true);
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
                params: { input: text, key: GOOGLE_PLACES_API_KEY, language: 'ko', components: 'country:KR' }
            });
            if (response.data.predictions) setLocationResults(response.data.predictions);
        } catch (error) {
            console.error("Google API Error:", error);
            alert("위치 정보를 가져오는 데 실패했습니다.");
        } finally {
            setIsLocationLoading(false);
        }
    };

    const onSelectLocation = async (place) => {
        setIsLocationLoading(true);
        setLocationSearchQuery(place.description);
        setLocationResults([]);
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
                params: { place_id: place.place_id, key: GOOGLE_PLACES_API_KEY, language: 'ko', fields: 'geometry,address_components' }
            });
            const { result } = response.data;
            if (result.geometry) {
                const { lat, lng } = result.geometry.location;
                const newLocation = { latitude: lat, longitude: lng };
                const cityComponent = result.address_components.find(c => c.types.includes('locality'));
                setUserLocation(newLocation);
                setUserCity(cityComponent ? cityComponent.long_name : place.terms[0].value);
                if (mapViewRef.current) {
                    mapViewRef.current.animateToRegion({ ...newLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 1000);
                }
            }
        } catch (error) {
            console.error("Google Geocoding API Error:", error);
            alert("선택한 위치의 좌표를 가져오는 데 실패했습니다.");
        } finally {
            setIsLocationLoading(false);
            setLocationModalVisible(false);
        }
    };

    const fetchCurrentLocation = async (showAlert = false) => {
        setIsLocationLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            if (showAlert) alert('위치 정보 접근 권한이 거부되었습니다.');
            // Context에 기본 위치 설정 (선택 사항)
            setUserLocation({ latitude: 37.4776, longitude: 126.9825 });
            setUserCity('서울');
        } else {
            let location = await Location.getCurrentPositionAsync({});
            let address = await Location.reverseGeocodeAsync(location.coords);
            if (address.length > 0) {
                setUserLocation(location.coords);
                setUserCity(address[0].city);
            }
        }
        setIsLocationLoading(false);
        setLocationModalVisible(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            if (route.params?.selectedPlace) {
                const place = route.params.selectedPlace;
                setSelectedPlace(place);
                setMapExpanded(false);
                if (mapViewRef.current) {
                    mapViewRef.current.animateToRegion({ ...place.coordinate, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 1000);
                }
                navigation.setParams({ selectedPlace: null });
            }
        }, [route.params?.selectedPlace])
    );

    // ✅ 앱 시작 시 위치 정보가 없으면 한 번만 가져오도록 useEffect 추가
    useEffect(() => {
        if (!userLocation) {
            fetchCurrentLocation();
        }
    }, [userLocation]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header
                userCity={userCity}
                onLocationPress={() => setLocationModalVisible(true)}
                onSearchPress={() => { /* 통합 검색 화면으로 이동 */ }}
            />
            <View style={styles.container}>
                <MapView
                    ref={mapViewRef}
                    style={StyleSheet.absoluteFill}
                    initialRegion={userLocation ? { ...userLocation, latitudeDelta: 0.0922, longitudeDelta: 0.0421 } : undefined}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    onPress={() => setSelectedPlace(null)}
                >
                    {selectedPlace && (
                        <Marker coordinate={selectedPlace.coordinate} onPress={() => handlePlacePress(selectedPlace)}>
                            <View style={styles.markerShadow}><Ionicons name="location" size={50} color="#FF7A00" /></View>
                            <Callout tooltip onPress={() => handlePlacePress(selectedPlace)}>
                                <View style={styles.calloutContainer}><Text style={styles.calloutTitle}>{selectedPlace.name}</Text></View>
                            </Callout>
                        </Marker>
                    )}
                </MapView>

                {isMapExpanded ? (
                    <TouchableOpacity style={styles.showListButton} onPress={() => setMapExpanded(false)}>
                        <Ionicons name="list-outline" size={24} color="#333" />
                        <Text style={styles.showListButtonText}>목록 보기</Text>
                    </TouchableOpacity>
                ) : (
                    <ScrollView style={styles.contentScrollView} showsVerticalScrollIndicator={false}>
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
                        <TouchableOpacity style={styles.directionsButton} onPress={() => openNaverMapDirections(selectedPlace.coordinate.latitude, selectedPlace.coordinate.longitude, selectedPlace.name)}>
                            <Ionicons name="navigate-circle-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.directionsButtonText}>{selectedPlace.name} 길찾기</Text>
                        </TouchableOpacity>
                    </View>
                )}

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
                            {isLocationLoading ? (
                                <ActivityIndicator size="large" color="#FF7A00" style={{ marginTop: 20 }} />
                            ) : (
                                <FlatList
                                    data={locationResults}
                                    keyExtractor={(item) => item.place_id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.locationResultItem} onPress={() => onSelectLocation(item)}>
                                            <Ionicons name="location-outline" size={20} color="#555" style={styles.locationResultIcon} />
                                            <Text style={styles.locationResultText}>{item.description}</Text>
                                        </TouchableOpacity>
                                    )}
                                    keyboardShouldPersistTaps="handled"
                                />
                            )}
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
    calloutContainer: { backgroundColor: '#fff', borderRadius: 10, padding: 12, elevation: 6 },
    calloutTitle: { fontWeight: 'bold', fontSize: 16 },
    floatingButtonContainer: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
    directionsButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00C73C', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, elevation: 5 },
    directionsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
    locationModalKeyboardAvoidingView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
    fullScreenOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
    locationModalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '90%', maxHeight: '80%' },
    locationModalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    currentLocationButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFEBDA', paddingVertical: 12, borderRadius: 10, marginBottom: 15 },
    currentLocationButtonText: { color: '#FF7A00', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 15, marginBottom: 10 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 45, fontSize: 16 },
    locationResultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    locationResultIcon: { marginRight: 15 },
    locationResultText: { fontSize: 16, flex: 1 },
});