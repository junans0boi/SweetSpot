import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import API_BASE_URL from '../config/api'; // ✅ 기존 설정 파일에서 URL 가져오기

// 1. Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL, // 가져온 URL 사용
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. 요청 인터셉터 설정 (자동으로 토큰 주입)
apiClient.interceptors.request.use(
    async (config) => {
        // SecureStore에서 토큰을 꺼내옴
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            // 토큰이 있으면 헤더에 Bearer 토큰 추가
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. 응답 인터셉터 (선택 사항: 토큰 만료 시 처리 등)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // 예: 401 에러 시 로그아웃 처리 로직 등을 여기에 추가 가능
        return Promise.reject(error);
    }
);

export default apiClient;