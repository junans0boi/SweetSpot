import { FRONT_BASE_URL } from '@env'; 
// 주의: .env 파일 안에 변수명이 FRONT_BASE_URL 인지 API_BASE_URL 인지 확인하세요.
// 님 .env 파일에는 FRONT_BASE_URL=https://sweetspot.kro.kr 라고 되어 있었습니다.

// 1. 환경변수가 없으면 기본값(하드코딩) 사용 (안전장치)
const BASE_URL = FRONT_BASE_URL || 'https://sweetspot.kro.kr'; 

// 2. http/https 접두사 확인 및 처리
const API_BASE_URL = BASE_URL.startsWith('http')
    ? BASE_URL
    : `https://${BASE_URL}`; // SSL 적용된 서버이므로 https 권장

console.log("✅ Current API URL:", API_BASE_URL); // 디버깅용 로그

export default API_BASE_URL;