import { Linking, Alert } from 'react-native'; // Alert를 import 합니다.

/**
 * 네이버 지도로 길찾기 기능을 실행하는 함수
 * @param {number} lat - 목적지 위도
 * @param {number} lng - 목적지 경도
 * @param {string} name - 목적지 이름
 */
export const openNaverMapDirections = async (lat, lng, name) => {
    // ✅ 1. [오류 수정] 좌표 값이 유효한 숫자인지 먼저 확인합니다.
    // "coordinates must be finite numbers" 오류를 근본적으로 해결합니다.
    if (typeof lat !== 'number' || typeof lng !== 'number' || !isFinite(lat) || !isFinite(lng)) {
        Alert.alert(
            '오류',
            '목적지 좌표가 올바르지 않아 길찾기를 실행할 수 없습니다.'
        );
        console.error('Invalid coordinates provided:', { lat, lng });
        return; // 좌표가 없으면 함수를 즉시 중단합니다.
    }

    const encodedName = encodeURIComponent(name);

    // ✅ 2. [공식 문서 기준] 네이버 지도 앱 딥링크 URL
    // slat, slng (출발지)를 생략하면 자동으로 '현위치'에서 출발합니다.
    // appname은 필수 파라미터입니다.
    const deepLinkUrl = `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encodedName}&appname=com.hollywood.sweetspot`;

    // ✅ 3. [공식 문서 기준] 네이버 지도 웹 길찾기 URL (앱 미설치 시)
    // 최신 v5 버전을 기준으로, 출발지를 '현재위치'로 명시하여 현위치 기반 길찾기를 실행합니다.
    const webUrl = `https://map.naver.com/v5/directions/,,현재위치/${lng},${lat},${encodedName}`;

    try {
        const isNaverMapInstalled = await Linking.canOpenURL(deepLinkUrl);

        if (isNaverMapInstalled) {
            await Linking.openURL(deepLinkUrl);
        } else {
            await Linking.openURL(webUrl);
        }
    } catch (error) {
        console.error('길찾기 실행 중 오류 발생:', error);
        Alert.alert('오류', '길찾기 기능을 실행하는 도중 문제가 발생했습니다.');
    }
};