import React, { createContext, useState, useEffect, useContext } from 'react';
import { GOOGLE_PLACES_API_KEY as API_KEY } from '@env'; // ✨ @env에서 API 키 import
import axios from 'axios';
import * as Location from 'expo-location';
import allRestaurantData from '../../restaurants.json';
import proj4 from 'proj4';

// 좌표계 설정
proj4.defs("EPSG:5174", "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43");

export const PlacesContext = createContext();

export const PlacesProvider = ({ children }) => {
    const [savedPlaces, setSavedPlaces] = useState([allRestaurantData[10], allRestaurantData[25]]);
    const [userLocation, setUserLocation] = useState(null);
    const [userCity, setUserCity] = useState(null);
    const [allPlaces, setAllPlaces] = useState([]);

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

    useEffect(() => {
        const transformedData = allRestaurantData.map(place => {
            if (place.coordinate && place.coordinate.longitude && place.coordinate.latitude) {
                const [lon, lat] = proj4("EPSG:5174", "WGS84", [place.coordinate.longitude, place.coordinate.latitude]);
                return { ...place, coordinate: { latitude: lat, longitude: lon } };
            }
            return null;
        }).filter(Boolean);
        setAllPlaces(transformedData);

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setUserLocation({ latitude: 37.3946, longitude: 126.9573 });
                setUserCity('안양시');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            try {
                // ✨ Expo의 reverseGeocodeAsync 대신 Google Geocoding API 직접 사용
                const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        latlng: `${latitude},${longitude}`,
                        key: API_KEY, // ✨ .env에서 가져온 키 사용
                        language: 'ko',
                    },
                });

                if (response.data.results && response.data.results.length > 0) {
                    const addressComponents = response.data.results[0].address_components;
                    const cityComponent = addressComponents.find(c => c.types.includes('locality'));
                    setUserCity(cityComponent ? cityComponent.long_name : '알 수 없음');
                }
                setUserLocation({ latitude, longitude });

            } catch (error) {
                console.error("Google Geocoding API Error on startup:", error);
                // API 실패 시 기본값 설정
                setUserLocation({ latitude: 37.3946, longitude: 126.9573 });
                setUserCity('안양시');
            }
        })();
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
            GOOGLE_PLACES_API_KEY: API_KEY, // ✨ Context를 통해 API 키 제공
        }}>
            {children}
        </PlacesContext.Provider>
    );
};

