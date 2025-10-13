import React, {useState, useEffect, useRef, useContext} from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Modal,
    ActivityIndicator,
    Platform,
    StatusBar,
    KeyboardAvoidingView
} from 'react-native';
import MapView, {Marker, Callout} from 'react-native-maps';
import {Ionicons} from '@expo/vector-icons';
import * as Location from 'expo-location';
import proj4 from 'proj4';
import axios from 'axios';
import {useFocusEffect} from '@react-navigation/native'; // ✅ useFocusEffect 훅 추가
import { PlacesContext } from '../contexts/PlacesContext'; // Context import

// --- 분리된 컴포넌트들 Import ---
import Header from '../components/Header';
import PlaceCard from '../components/PlaceCard';


// 데이터 로딩
import allRestaurantData from '../../restaurants.json';

// 좌표계 설정
proj4.defs("EPSG:5174", "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43");

const {width, height} = Dimensions.get('window');

// 태그 기반 카테고리 정의
const TAG_CATEGORIES = [
    {id: 'all', name: '전체', icon: 'fast-food-outline', tag: null},
    {id: 'date', name: '데이트', icon: 'heart-outline', tag: '데이트'},
    {id: 'family', name: '가족외식', icon: 'people-outline', tag: '가족외식'},
    {id: 'cafe', name: '카페·디저트', icon: 'cafe-outline', tag: '카페·디저트'},
    {id: 'drink', name: '술집', icon: 'beer-outline', tag: '술집'},
    {id: 'meat', name: '고기', icon: 'bonfire-outline', tag: '고기'},
];

// 거리 계산 함수
function getDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

export default function HomeScreen({route, navigation}) {
    // --- 상태 변수 선언 ---
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [allPlaces, setAllPlaces] = useState([]);
    const [displayedPlaces, setDisplayedPlaces] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [userCity, setUserCity] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [locationSearchQuery, setLocationSearchQuery] = useState('');
    const [locationResults, setLocationResults] = useState([]);
    const [isLocationLoading, setIsLocationLoading] = useState(false);

    const mapViewRef = useRef(null);

    // --- 함수 선언 ---
    const fetchCurrentLocation = async (showAlert = false) => {
        setIsLocationLoading(true);
        let {status} = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            if (showAlert) alert('위치 정보 접근 권한이 거부되었습니다.');
            setUserLocation({latitude: 37.3946, longitude: 126.9573});
            setUserCity('안양시');
            setIsLocationLoading(false);
            return;
        }
        let location = await Location.getCurrentPositionAsync({});
        const {latitude, longitude} = location.coords;
        let address = await Location.reverseGeocodeAsync({latitude, longitude});
        if (address.length > 0) {
            setUserLocation({latitude, longitude});
            setUserCity(address[0].city);
        }
        setIsLocationLoading(false);
        setLocationModalVisible(false);
    };

    const searchLocations = async (text) => {
        setLocationSearchQuery(text);
        if (text.length > 1) {
            setIsLocationLoading(true);
            try {
                const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
                    params: {input: text, key: GOOGLE_PLACES_API_KEY, language: 'ko', components: 'country:KR'}
                });
                if (response.data.predictions) setLocationResults(response.data.predictions);
            } catch (error) {
                if (error.response) console.error("Google API Error:", JSON.stringify(error.response.data, null, 2));
                else console.error("Network Error:", error.message);
                alert("위치 정보를 가져오는 데 실패했습니다.");
            } finally {
                setIsLocationLoading(false);
            }
        } else {
            setLocationResults([]);
        }
    };

    const onSelectLocation = async (place) => {
        setIsLocationLoading(true);
        setLocationSearchQuery(place.description);
        setLocationResults([]);
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
                params: {
                    place_id: place.place_id,
                    key: GOOGLE_PLACES_API_KEY,
                    language: 'ko',
                    fields: 'geometry,address_components'
                }
            });
            const {result} = response.data;
            if (result.geometry) {
                const {lat, lng} = result.geometry.location;
                const newLocation = {latitude: lat, longitude: lng};
                const cityComponent = result.address_components.find(c => c.types.includes('locality'));
                setUserLocation(newLocation);
                setUserCity(cityComponent ? cityComponent.long_name : place.terms[0].value);
                if (mapViewRef.current) {
                    mapViewRef.current.animateToRegion({
                        ...newLocation,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05
                    }, 1000);
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

    const onPlacePress = (place) => {
        if (mapViewRef.current) {
            setModalVisible(false);
            setSelectedPlace(place);
            const region = {
                latitude: place.coordinate.latitude,
                longitude: place.coordinate.longitude,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
            };
            mapViewRef.current.animateToRegion(region, 1000);
        }
    };

    const goToMyLocation = async () => {
        let {status} = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('위치 정보 접근 권한이 필요합니다.');
            return;
        }
        let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.High});
        const {latitude, longitude} = location.coords;
        if (mapViewRef.current) {
            mapViewRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    };

    // --- useEffect Hooks ---
    useEffect(() => {
        const transformedData = allRestaurantData.map(place => {
            if (place.coordinate && place.coordinate.longitude && place.coordinate.latitude) {
                const [lon, lat] = proj4("EPSG:5174", "WGS84", [place.coordinate.longitude, place.coordinate.latitude]);
                return {...place, coordinate: {latitude: lat, longitude: lon}};
            }
            return null;
        }).filter(Boolean);
        setAllPlaces(transformedData);
        fetchCurrentLocation();
    }, []);

    useEffect(() => {
        if (!userLocation || !userCity || allPlaces.length === 0) return;
        setIsLoading(true);
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const filtered = allPlaces
            .filter(place => place.address && place.address.includes(userCity))
            .filter(place => (normalizedQuery === '') ? true : place.name.toLowerCase().includes(normalizedQuery))
            .filter(place => (!selectedTag) ? true : (place.tags && place.tags.includes(selectedTag)));
        const sorted = filtered
            .map(place => ({
                ...place,
                distance: getDistance(userLocation.latitude, userLocation.longitude, place.coordinate.latitude, place.coordinate.longitude)
            }))
            .sort((a, b) => a.distance - b.distance);
        setDisplayedPlaces(sorted);
        setIsLoading(false);
    }, [userLocation, userCity, allPlaces, searchQuery, selectedTag]);
    useFocusEffect(
        React.useCallback(() => {
            // route.params에 selectedPlace가 있으면
            if (route.params?.selectedPlace) {
                const placeFromParams = route.params.selectedPlace;
                // onPlacePress 함수를 호출하여 지도를 이동시키고 마커를 표시
                onPlacePress(placeFromParams);
                // 파라미터를 사용한 후에는 초기화하여 중복 실행 방지
                navigation.setParams({selectedPlace: null});
            }
        }, [route.params?.selectedPlace])
    );
    // --- Render Functions ---
    const renderCategory = ({item}) => (
        <TouchableOpacity
            style={[styles.categoryButton, selectedTag === item.tag && styles.selectedCategory]}
            onPress={() => setSelectedTag(item.tag)}>
            <Ionicons name={item.icon} size={24} color={selectedTag === item.tag ? '#FF7A00' : '#555'}/>
            <Text
                style={[styles.categoryText, selectedTag === item.tag && styles.selectedCategoryText]}>{item.name}</Text>
        </TouchableOpacity>
    );
    const {savedPlaces, onToggleSave, GOOGLE_PLACES_API_KEY} = useContext(PlacesContext);

    const renderPlaceItem = ({item}) => (
        <PlaceCard
            item={item}
            onPress={() => onPlacePress(item)}
            // ✨ Context에서 가져온 값들을 PlaceCard에 전달
            isSaved={savedPlaces.some(p => p.id === item.id)}
            onToggleSave={onToggleSave}
        />
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content"/>
            <Header
                userCity={userCity}
                onLocationPress={() => setLocationModalVisible(true)}
                onSearchPress={() => setModalVisible(true)}
            />
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapViewRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: 37.3946,
                        longitude: 126.9573,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={false}>
                    {selectedPlace && (
                        <Marker coordinate={selectedPlace.coordinate} anchor={{x: 0.5, y: 1}}>
                            <View style={styles.markerShadow}>
                                <Ionicons name="location" size={60} color="#FF7A00"/>
                            </View>
                            <Callout tooltip>
                                <View style={styles.calloutContainer}>
                                    <Image source={{uri: selectedPlace.image}} style={styles.calloutImage}/>
                                    <View style={styles.calloutTextContainer}>
                                        <Text style={styles.calloutTitle}>{selectedPlace.name}</Text>
                                        <Text style={styles.calloutAddress}>{selectedPlace.address}</Text>
                                        <View style={styles.calloutTagsContainer}>
                                            {selectedPlace.tags.slice(0, 4).map((tag, index) => (
                                                <View key={index} style={styles.calloutTag}><Text
                                                    style={styles.calloutTagText}>#{tag}</Text></View>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </Callout>
                        </Marker>
                    )}
                </MapView>
                <TouchableOpacity style={styles.mapButton} onPress={goToMyLocation}>
                    <Ionicons name="navigate-outline" size={26} color="#333"/>
                </TouchableOpacity>
            </View>


            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalHandle}>
                            <View style={styles.modalHandleBar}/>
                        </TouchableOpacity>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon}/>
                            <TextInput
                                style={styles.searchInput}
                                placeholder={`${userCity || ''}에서 장소 검색`}
                                placeholderTextColor="#888"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                returnKeyType="search"
                            />
                        </View>
                        <View>
                            <FlatList
                                data={TAG_CATEGORIES}
                                renderItem={renderCategory}
                                keyExtractor={(item) => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoryList}
                            />
                        </View>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#FF7A00"
                                               style={{flex: 1, justifyContent: 'center'}}/>
                        ) : (
                            displayedPlaces.length > 0 ? (
                                <FlatList
                                    data={displayedPlaces}
                                    renderItem={renderPlaceItem}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={{paddingBottom: 20}}
                                />
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>앗, 이 근처에는 결과가 없어요.</Text>
                                    <Text style={styles.emptySubText}>다른 검색어나 카테고리를 선택해보세요.</Text>
                                </View>
                            )
                        )}
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={locationModalVisible}
                onRequestClose={() => setLocationModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                      style={styles.locationModalKeyboardAvoidingView}>
                    <TouchableOpacity style={styles.fullScreenOverlay} activeOpacity={1}
                                      onPress={() => setLocationModalVisible(false)}/>
                    <View style={styles.locationModalContent}>
                        <Text style={styles.locationModalTitle}>위치 설정</Text>
                        <TouchableOpacity style={styles.currentLocationButton}
                                          onPress={() => fetchCurrentLocation(true)}>
                            <Ionicons name="navigate-circle-outline" size={22} color="#FF7A00"/>
                            <Text style={styles.currentLocationButtonText}>현재 위치로 설정</Text>
                        </TouchableOpacity>
                        <View style={styles.searchBar}>
                            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon}/>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="예: 산본역, 강남역"
                                value={locationSearchQuery}
                                onChangeText={searchLocations}
                            />
                        </View>
                        {isLocationLoading ? (
                            <ActivityIndicator size="large" color="#FF7A00" style={{marginTop: 20}}/>
                        ) : (
                            <FlatList
                                data={locationResults}
                                keyExtractor={(item) => item.place_id}
                                renderItem={({item}) => (
                                    <TouchableOpacity style={styles.locationResultItem}
                                                      onPress={() => onSelectLocation(item)}>
                                        <Ionicons name="location-outline" size={20} color="#555"
                                                  style={styles.locationResultIcon}/>
                                        <Text style={styles.locationResultText}>{item.description}</Text>
                                    </TouchableOpacity>
                                )}
                                keyboardShouldPersistTaps="handled"
                            />
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: '#fff'},
    mapContainer: {flex: 1, position: 'relative'},
    map: {...StyleSheet.absoluteFillObject},
    mapButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 30,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 4
    },
    modalOverlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.4)'},
    modalContent: {
        backgroundColor: '#f8f8f8',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 10,
        height: height * 0.85
    },
    modalHandle: {alignItems: 'center', paddingVertical: 8},
    modalHandleBar: {width: 40, height: 5, backgroundColor: '#ccc', borderRadius: 5},
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 15,
        marginHorizontal: 15,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#eee'
    },
    searchIcon: {marginRight: 10},
    searchInput: {flex: 1, height: 45, fontSize: 16},
    categoryList: {paddingHorizontal: 15, paddingVertical: 10},
    categoryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        borderRadius: 15,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee'
    },
    selectedCategory: {backgroundColor: '#FFEBDA', borderColor: '#FF7A00'},
    categoryText: {fontSize: 14, color: '#555', marginTop: 5, fontWeight: '500'},
    selectedCategoryText: {color: '#FF7A00', fontWeight: 'bold'},
    emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50},
    emptyText: {fontSize: 18, fontWeight: 'bold', color: '#555'},
    emptySubText: {fontSize: 14, color: '#888', marginTop: 8},
    markerShadow: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10
    },
    calloutContainer: {
        width: 280,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 10,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    calloutImage: {width: '100%', height: 120, borderRadius: 10},
    calloutTextContainer: {paddingTop: 10},
    calloutTitle: {fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5},
    calloutAddress: {fontSize: 13, color: '#666', marginBottom: 8},
    calloutTagsContainer: {flexDirection: 'row', flexWrap: 'wrap'},
    calloutTag: {
        backgroundColor: '#FFEBDA',
        borderRadius: 8,
        paddingVertical: 3,
        paddingHorizontal: 8,
        marginRight: 6,
        marginBottom: 6
    },
    calloutTagText: {color: '#FF7A00', fontSize: 11, fontWeight: '500'},
    locationModalKeyboardAvoidingView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    locationModalContent: {backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '90%', maxHeight: '80%'},
    locationModalTitle: {fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20},
    currentLocationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFEBDA',
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 15
    },
    currentLocationButtonText: {color: '#FF7A00', fontSize: 16, fontWeight: 'bold', marginLeft: 8},
    locationResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    locationResultIcon: {marginRight: 15},
    locationResultText: {fontSize: 16, flex: 1},
    fullScreenOverlay: {position: 'absolute', top: 0, bottom: 0, left: 0, right: 0},
});
