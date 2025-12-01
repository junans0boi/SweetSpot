import apiClient from './client';

// 내 주변 장소 조회
export const getNearbyPlaces = async (lat, lng, radius = 2000) => {
    try {
        const response = await apiClient.get('/api/places/nearby', {
            params: { lat, lng, radius }
        });
        return response.data;
    } catch (error) {
        console.error("주변 장소 조회 실패:", error);
        throw error;
    }
};

// 장소 상세 조회
export const getPlaceDetails = async (id) => {
    try {
        const response = await apiClient.get(`/api/places/details/${id}`);
        return response.data;
    } catch (error) {
        console.error("장소 상세 조회 실패:", error);
        throw error;
    }
};