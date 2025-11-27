import apiClient from './client';

// 리뷰 작성
export const createReview = async (reviewData) => {
    const response = await apiClient.post('/api/reviews', reviewData);
    return response.data;
};

// 특정 장소의 리뷰 조회
export const getReviewsByPlace = async (placeId) => {
    const response = await apiClient.get(`/api/reviews/place/${placeId}`);
    return response.data;
};

// 리뷰 삭제
export const deleteReview = async (reviewId) => {
    await apiClient.delete(`/api/reviews/${reviewId}`);
};