import { API_BASE_URL as BASE_URL } from '@env';

// BASE_URL에 이미 'http'가 들어있는지 체크
const API_BASE_URL = BASE_URL.startsWith('http')
    ? BASE_URL
    : `http://${BASE_URL}`;

export default API_BASE_URL;