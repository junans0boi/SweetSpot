import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { getNearbyPlaces } from '../api/placeService';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import * as SecureStore from 'expo-secure-store';

export const PlacesContext = createContext();

export const PlacesProvider = ({ children }) => {
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [userCity, setUserCity] = useState(null);
    const [allPlaces, setAllPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ [수정] 찜 토글 (디버깅 로그 추가)
    const handleToggleSave = async (place) => {
        // 1. 유효성 검사
        if (!place || !place.id) {
            console.error("❌ 찜 오류: 장소 ID가 없습니다.", place);
            Alert.alert("오류", "장소 정보를 찾을 수 없습니다.");
            return;
        }

        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) {
                Alert.alert("로그인 필요", "찜 기능을 사용하려면 로그인이 필요합니다.");
                return;
            }

            console.log(`❤️ 찜 요청: ID=${place.id}, Token 존재함`);

            // 2. 요청 전송
            const response = await axios.post(`${API_BASE_URL}/api/places/${place.id}/like`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const isLiked = response.data;
            console.log(`✅ 찜 결과: ${isLiked}`);

            // 3. 상태 업데이트
            setSavedPlaces(prev => {
                if (isLiked) {
                    if (prev.some(p => p.id === place.id)) return prev;
                    return [...prev, place];
                } else {
                    return prev.filter(p => p.id !== place.id);
                }
            });
        } catch (error) {
            console.error("❌ 찜 토글 실패:", error.message);
            if (error.response) {
                console.error("서버 응답:", error.response.status, error.response.data);
                if (error.response.status === 400) {
                    Alert.alert("요청 오류", "잘못된 요청입니다. (400)");
                } else if (error.response.status === 401) {
                    Alert.alert("인증 실패", "로그인이 만료되었습니다.");
                }
            }
        }
    };

    // ✅ [수정] 찜 목록 로딩 (에러 로그 강화)
    const loadMyLikes = async () => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/places/my-likes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSavedPlaces(response.data);
        } catch (error) {
            console.log("⚠️ 찜 목록 로드 실패:", error.message);
        }
    };

    // 주변 장소 로딩
    const loadNearbyPlaces = async (lat, lng) => {
        try {
            // console.log(`📡 API 호출: lat=${lat}, lng=${lng}`);
            const data = await getNearbyPlaces(lat, lng, 3000);
            setAllPlaces(data);
        } catch (error) {
            console.error("장소 데이터 로드 실패:", error);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                let location = { latitude: 37.5665, longitude: 126.9780 };
                let city = '서울 중구';

                if (status === 'granted') {
                    try {
                        const locPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
                        const loc = await Promise.race([locPromise, timeoutPromise]);
                        location = loc.coords;
                        
                        const address = await Location.reverseGeocodeAsync(location);
                        if (address.length > 0) {
                            city = `${address[0].city || ''} ${address[0].district || ''}`.trim();
                        }
                    } catch (e) { /* 무시 */ }
                }

                setUserLocation(location);
                setUserCity(city);

                await Promise.all([
                    loadNearbyPlaces(location.latitude, location.longitude),
                    loadMyLikes()
                ]);

            } catch (error) {
                console.error("초기 데이터 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    return (
        <PlacesContext.Provider value={{
            savedPlaces,
            onToggleSave: handleToggleSave,
            userLocation,
            userCity,
            allPlaces,
            setUserLocation,
            setUserCity,
            isLoading,
            refreshPlaces: () => {
                if (userLocation) loadNearbyPlaces(userLocation.latitude, userLocation.longitude);
                loadMyLikes();
            }
        }}>
            {children}
        </PlacesContext.Provider>
    );
};