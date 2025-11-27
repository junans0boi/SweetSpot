import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { GOOGLE_PLACES_API_KEY as API_KEY } from '@env';
import * as Location from 'expo-location';

// ✅ 1. axios, API_BASE_URL 삭제
// ✅ 2. 우리가 만든 작은 목업 파일을 직접 import 합니다.
import mockPlacesData from '../data/places.mock.json';

export const PlacesContext = createContext();

export const PlacesProvider = ({ children }) => {
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [userCity, setUserCity] = useState(null);

    // ✅ 3. allPlaces의 초기값을 목업 데이터로 바로 설정합니다.
    const [allPlaces, setAllPlaces] = useState(mockPlacesData);
    const [isLoading, setIsLoading] = useState(true);

    const handleToggleSave = (place) => {
        setSavedPlaces(prev => {
            const isSaved = prev.some(p => p.id === place.id);
            if (isSaved) {
                return prev.filter(p => p.id !== place.id);
            } else {
                return [...prev, place];
            }
        });
    };

    // ✅ 4. fetchNearbyPlaces 함수를 완전히 제거합니다. (더 이상 필요 없음)

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // ✅ 5. 거대한 JSON 로딩/파싱/API 호출 로직이 모두 사라지고,
                //    오직 '현재 위치'를 가져오는 작업만 남깁니다.
                /* let { status } = await Location.requestForegroundPermissionsAsync();
                let location;
                if (status !== 'granted') {
                    location = { latitude: 37.3615, longitude: 126.9318 }; // 기본 위치 (산본)
                    setUserCity('군포시');
                } else {
                    const loc = await Location.getCurrentPositionAsync({});
                    location = loc.coords;
                    let address = await Location.reverseGeocodeAsync(location);
                    if (address.length > 0) setUserCity(address[0].city);
                }
                setUserLocation(location);
                */
                setUserLocation({ latitude: 37.3615, longitude: 126.9318 });
                setUserCity('경기 군포');
            } catch (error) {
                console.error("초기 데이터 로딩 실패:", error);
            } finally {
                setIsLoading(false); // 위치 정보만 가져오면 로딩 끝!
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
            allPlaces, // ✅ 항상 목업 데이터를 반환
            setUserLocation,
            setUserCity,
            GOOGLE_PLACES_API_KEY: API_KEY,
            isLoading,
        }}>
            {children}
        </PlacesContext.Provider>
    );
};

