import apiClient from './client';

// 페이징된 리뷰 목록 조회
export const getReviewsByPlace = async (placeId, page = 0, size = 10) => {
    const response = await apiClient.get(`/api/reviews/place/${placeId}`, {
        params: { page, size }
    });
    return response.data;
};

// 리뷰 작성
export const createReview = async (reviewData) => {
    const response = await apiClient.post('/api/reviews', reviewData);
    return response.data;
};

// ✅ [추가] 리뷰 수정
export const updateReview = async (reviewId, reviewData) => {
    const response = await apiClient.put(`/api/reviews/${reviewId}`, reviewData);
    return response.data;
};

// 리뷰 삭제
export const deleteReview = async (reviewId) => {
    await apiClient.delete(`/api/reviews/${reviewId}`);
};