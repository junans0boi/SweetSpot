import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
// import { GOOGLE_PLACES_API_KEY as API_KEY } from '@env'; // ⚠️ 구글 키 사용 안 함
import * as Location from 'expo-location';
import { getNearbyPlaces } from '../api/placeService';

export const PlacesContext = createContext();

export const PlacesProvider = ({ children }) => {
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [userCity, setUserCity] = useState(null);

    const [allPlaces, setAllPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 저장(찜) 토글
    const handleToggleSave = (place) => {
        setSavedPlaces(prev => {
            const isSaved = prev.some(p => p.id === place.id);
            if (isSaved) return prev.filter(p => p.id !== place.id);
            else return [...prev, place];
        });
    };

    // ✅ [핵심] API를 호출하여 주변 장소를 가져오는 함수
    const loadNearbyPlaces = async (lat, lng) => {
        try {
            // setIsLoading(true); // (선택) 지도 이동 시마다 로딩 표시를 원하면 주석 해제
            console.log(`📡 API 호출: lat=${lat}, lng=${lng}`);
            
            // 백엔드 API 호출 (반경 3km)
            const data = await getNearbyPlaces(lat, lng, 3000); 
            
            console.log(`✅ 데이터 수신 완료: ${data.length}개 장소`);
            setAllPlaces(data);
        } catch (error) {
            console.error("장소 데이터 로드 실패:", error);
            // Alert.alert("오류", "주변 정보를 불러오지 못했습니다."); // 너무 자주 뜨면 방해되므로 로그만 남김
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // 1. 위치 권한 요청
                let { status } = await Location.requestForegroundPermissionsAsync();
                
                let location;
                let city = '위치 확인 불가';

                if (status !== 'granted') {
                    // 권한 거부 시 서울 시청 기본값
                    location = { latitude: 37.5665, longitude: 126.9780 }; 
                    city = '서울 중구';
                    Alert.alert('알림', '위치 권한이 없어 기본 위치(서울시청)로 설정됩니다.');
                } else {
                    // 현재 위치 가져오기
                    const loc = await Location.getCurrentPositionAsync({});
                    location = loc.coords;
                    
                    // 주소 변환 (역지오코딩)
                    const address = await Location.reverseGeocodeAsync(location);
                    if (address.length > 0) {
                        city = `${address[0].city || ''} ${address[0].district || ''}`.trim();
                    }
                }

                // 상태 업데이트
                setUserLocation(location);
                setUserCity(city);

                // ✅ 2. 위치를 잡았으니 API 호출!
                await loadNearbyPlaces(location.latitude, location.longitude);

            } catch (error) {
                console.error("초기 데이터 로딩 실패:", error);
                // 에러 발생 시에도 기본 위치로 셋팅해서 앱이 멈추지 않게 함
                setUserLocation({ latitude: 37.5665, longitude: 126.9780 });
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
            allPlaces, // ✅ HomeScreen에서 사용할 전체 장소 데이터
            setUserLocation,
            setUserCity,
            isLoading,
            // 위치가 바뀌거나 재검색할 때 호출할 함수
            refreshPlaces: () => userLocation && loadNearbyPlaces(userLocation.latitude, userLocation.longitude)
        }}>
            {children}
        </PlacesContext.Provider>
    );
};