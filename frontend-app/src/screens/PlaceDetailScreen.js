import React, { useState, useEffect } from 'react'; // ✅ useState, useEffect 추가
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
// ✅ [수정] useIsFocused 추가
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { openNaverMapDirections } from '../utils/navigationUtils';
import ReviewCard from '../components/ReviewCard';
import { getReviewsByPlace } from '../api/reviewService';
// --- 카테고리별 정보 블록 컴포넌트들 ---
const RestaurantInfo = ({ place }) => (
    <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>운영 시간</Text>
        <Text style={styles.infoText}>매일 09:00 - 22:00 (임시 데이터)</Text>
    </View>
);
const PCBangInfo = ({ info }) => (
    <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>주요 정보</Text>
        <View style={styles.infoRow}><Ionicons name="desktop-outline" size={20} color="#555" /><Text style={styles.infoText}>그래픽카드: {info.spec}</Text></View>
        <View style={styles.infoRow}><Ionicons name="people-outline" size={20} color="#555" /><Text style={styles.infoText}>총 좌석: {info.seatCount}석</Text></View>
        <View style={styles.infoRow}><Ionicons name="fast-food-outline" size={20} color="#555" /><Text style={styles.infoText}>{info.hasFood ? '음식 판매' : '음식 미판매'}</Text></View>
    </View>
);
const CinemaInfo = ({ info }) => (
    <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>현재 상영작</Text>
        {info.nowPlaying.map(movie => (
            <View key={movie} style={styles.infoRow}>
                <Ionicons name="film-outline" size={20} color="#555" />
                <Text style={styles.infoText}>{movie}</Text>
            </View>
        ))}
    </View>
);

// --- 헤더 컴포넌트 ---
const DetailHeader = ({ name, onBack }) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
        <View style={{ width: 24 }} />
    </View>
);

// --- 메인 상세 화면 ---
export default function PlaceDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused(); // 화면 포커스 감지
    const { place } = route.params;

    // ✅ 리뷰 상태 관리
    const [reviews, setReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);

    // ✅ 리뷰 데이터 불러오기
    const fetchReviews = async () => {
        try {
            setIsLoadingReviews(true);
            const data = await getReviewsByPlace(place.id);
            setReviews(data);
        } catch (error) {
            console.error("리뷰 로딩 실패:", error);
        } finally {
            setIsLoadingReviews(false);
        }
    };
    useEffect(() => {
        if (place?.id && isFocused) {
            fetchReviews();
        }
    }, [place, isFocused]);

    // ✅ 3. place 객체가 없을 경우를 대비한 방어 코드
    if (!place) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <DetailHeader name="오류" onBack={() => navigation.goBack()} />
                <View style={styles.errorView}>
                    <Ionicons name="alert-circle-outline" size={50} color="#888" />
                    <Text style={styles.errorText}>장소 정보를 불러오지 못했습니다.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const renderCategorySpecificInfo = () => {
        switch (place.mainCategory) {
            case '맛집':
            case '카페':
                return <RestaurantInfo place={place} />;
            case '놀거리':
                if (place.pcbangInfo) return <PCBangInfo info={place.pcbangInfo} />;
                return null;
            case '문화/관광':
                if (place.cinemaInfo) return <CinemaInfo info={place.cinemaInfo} />;
                return null;
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <DetailHeader name={place.name} onBack={() => navigation.goBack()} />

            <ScrollView style={styles.container}>
                {/* <Image source={{ uri: place.image }} style={styles.mainImage} placeholder={'#e0e0e0'} transition={300} /> */}
                <Image
                    source={{ uri: 'https://placehold.co/600x400/png?text=Image+Suspended' }} // 임시 더미 이미지
                    style={styles.mainImage}
                    placeholder={'#e0e0e0'}
                    transition={300}
                />
                <View style={styles.infoContainer}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <View style={styles.ratingContainer}><Ionicons name="star" size={16} color="#FFD700" /><Text style={styles.ratingText}>{place.rating}</Text></View>
                    <View style={styles.infoRow}><Ionicons name="location-outline" size={20} color="#555" /><Text style={styles.infoText}>{place.address}</Text></View>
                    {/* {place.website && ( ... )} */}
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => openNaverMapDirections(place.coordinate.latitude, place.coordinate.longitude, place.name)}>
                        <Ionicons name="navigate-outline" size={22} color="#FFFFFF" /><Text style={styles.actionButtonText}>길찾기</Text>
                    </TouchableOpacity>
                </View>

                {renderCategorySpecificInfo()}

                {/* ✅ 리뷰 섹션 수정 */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>리뷰 ({reviews.length})</Text>

                    {isLoadingReviews ? (
                        <ActivityIndicator size="small" color="#FF7A00" />
                    ) : reviews.length > 0 ? (
                        reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={{
                                    authorName: review.authorName,
                                    rating: review.rating,
                                    text: review.text,
                                    photoUrls: review.photoUrls // 현재는 빈 배열
                                }}
                            />
                        ))
                    ) : (
                        <Text style={styles.emptyReviewText}>첫 리뷰의 주인공이 되어보세요!</Text>)}
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('WriteReview', { placeName: place.name, placeId: place.id })}>
                <Ionicons name="create-outline" size={28} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center', marginHorizontal: 10 },
    mainImage: { width: '100%', height: 250 },
    infoContainer: { padding: 20 },
    placeName: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    ratingText: { marginLeft: 5, fontSize: 16, fontWeight: 'bold' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    infoText: { marginLeft: 10, fontSize: 16, color: '#333', flex: 1 },
    linkText: { color: '#007AFF' },
    actionContainer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 15, paddingHorizontal: 20, borderTopWidth: 8, borderTopColor: '#f0f0f0' },
    actionButton: { flexDirection: 'row', backgroundColor: '#00C73C', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
    actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    sectionContainer: { paddingHorizontal: 20, paddingVertical: 20, borderTopWidth: 8, borderTopColor: '#f0f0f0' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    fab: { position: 'absolute', right: 25, bottom: 40, backgroundColor: '#FF7A00', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f8f8' },
    errorView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { marginTop: 10, color: '#d32f2f', fontSize: 16, textAlign: 'center' },
    emptyReviewText: { color: '#888', textAlign: 'center', padding: 20, fontSize: 14 }
});

