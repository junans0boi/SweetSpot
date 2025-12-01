import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { openNaverMapDirections } from '../utils/navigationUtils';
import ReviewCard from '../components/ReviewCard';
import { getReviewsByPlace, deleteReview } from '../api/reviewService';

// 태그 스타일 추가
const TagList = ({ tags }) => {
    if (!tags || tags.length === 0) return null;
    return (
        <View style={styles.tagRow}>
            {tags.map((tag, index) => (
                <View key={index} style={styles.tagBadge}>
                    <Text style={styles.tagText}>#{tag}</Text>
                </View>
            ))}
        </View>
    );
};
const DetailHeader = ({ name, onBack }) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
        <View style={{ width: 24 }} />
    </View>
);

// 장소 상세 정보를 보여주는 헤더 컴포넌트
const PlaceInfoSection = ({ place }) => {
    const renderCategorySpecificInfo = () => {
        if (place.mainCategory === '맛집' || place.mainCategory === '카페') {
            return (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>운영 시간</Text>
                    <Text style={styles.infoText}>매일 09:00 - 22:00 (임시 데이터)</Text>
                </View>
            );
        }
        return null;
    };

    return (
        <View>
            <Image
                source={{ uri: (place.photoUrls && place.photoUrls.length > 0) ? place.photoUrls[0] : null }}
                style={styles.mainImage}
                placeholder={'#e0e0e0'}
                transition={300}
            />

            <View style={styles.infoContainer}>
                <Text style={styles.placeName}>{place.name}</Text>

                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={18} color="#FFD700" />
                    <Text style={styles.ratingText}>{place.rating ? place.rating.toFixed(1) : '0.0'}</Text>
                    <Text style={styles.categoryText}>· {place.mainCategory}</Text>
                </View>

                {/* [추가] 태그 리스트 표시 */}
                <TagList tags={place.tags} />

                <View style={styles.addressRow}>
                    <Ionicons name="location-outline" size={18} color="#666" />
                    <Text style={styles.addressText}>{place.address}</Text>
                </View>
            </View>

            {/* ... 길찾기 버튼 및 기타 정보 (기존 동일) ... */}
            <View style={styles.actionContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openNaverMapDirections(place.lat, place.lng, place.name)}>
                    <Ionicons name="navigate-outline" size={22} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>길찾기</Text>
                </TouchableOpacity>
            </View>

            {renderCategorySpecificInfo()}

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>리뷰</Text>
            </View>
        </View>
    );
};

export default function PlaceDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();
    const { place } = route.params;

    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(0);
    const [isLastPage, setIsLastPage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // 리뷰 데이터 불러오기
    const fetchReviews = async (pageNum, isRefresh = false) => {
        try {
            if (isRefresh) setIsLoading(true);
            else setIsFetchingMore(true);

            console.log(`📥 리뷰 요청: page=${pageNum}, id=${place.id}`);
            const data = await getReviewsByPlace(place.id, pageNum, 10);

            console.log("📦 리뷰 응답 데이터:", data); // 디버깅용 로그

            // [핵심 수정] 데이터 구조 확인 및 방어 코드 추가
            let newReviews = [];
            let last = true;

            if (data && Array.isArray(data.content)) {
                // 1. 정상적인 Page 객체인 경우 ({ content: [...], last: ... })
                newReviews = data.content;
                last = data.last;
            } else if (Array.isArray(data)) {
                // 2. 만약 Page가 아니라 List(배열)로 온 경우 (백엔드 구버전 호환)
                newReviews = data;
                last = true; // 배열로 오면 페이징 정보가 없으므로 마지막으로 간주
            } else {
                // 3. 데이터가 없거나 이상한 경우
                console.warn("⚠️ 리뷰 데이터 형식이 예상과 다릅니다:", data);
                newReviews = [];
            }

            if (isRefresh) {
                setReviews(newReviews);
            } else {
                // [수정] 안전하게 스프레드 연산 사용 (빈 배열이라도 에러 안 남)
                setReviews(prev => [...prev, ...newReviews]);
            }

            setIsLastPage(last);
            setPage(pageNum);

        } catch (error) {
            console.error("리뷰 로딩 실패:", error);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        if (place?.id && isFocused) {
            fetchReviews(0, true);
        }
    }, [place, isFocused]);

    const handleLoadMore = () => {
        if (!isLastPage && !isFetchingMore && !isLoading) {
            fetchReviews(page + 1);
        }
    };
    // [추가] 리뷰 삭제 핸들러
    const handleDeleteReview = (reviewId) => {
        Alert.alert(
            "리뷰 삭제",
            "정말 이 리뷰를 삭제하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "삭제",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteReview(reviewId);
                            Alert.alert("삭제 완료", "리뷰가 삭제되었습니다.");
                            fetchReviews(0, true); // 목록 새로고침
                        } catch (error) {
                            Alert.alert("오류", "리뷰 삭제에 실패했습니다.");
                            console.error(error);
                        }
                    }
                }
            ]
        );
    };

    // [추가] 리뷰 수정 핸들러 (작성 화면으로 이동)
    const handleEditReview = (review) => {
        navigation.navigate('WriteReview', {
            placeName: place.name,
            placeId: place.id,
            review: review // 수정할 리뷰 객체 전달
        });
    };

    if (!place) return null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <DetailHeader name={place.name} onBack={() => navigation.goBack()} />

            <FlatList
                data={reviews}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <ReviewCard
                        review={item}
                        onEdit={handleEditReview}    // 연결
                        onDelete={handleDeleteReview} // 연결
                    />
                )}

                ListHeaderComponent={<PlaceInfoSection place={place} />}
                ListEmptyComponent={!isLoading && (<Text style={styles.emptyReviewText}>첫 리뷰의 주인공이 되어보세요!</Text>)}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isFetchingMore && <ActivityIndicator size="small" color="#FF7A00" style={{ margin: 20 }} />}
            />

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('WriteReview', { placeName: place.name, placeId: place.id })}>
                <Ionicons name="create-outline" size={28} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center', marginHorizontal: 10 },
    mainImage: { width: '100%', height: 250 },
    infoContainer: { padding: 20 },
    placeName: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    ratingText: { marginLeft: 4, fontSize: 16, fontWeight: 'bold', color: '#333' },
    categoryText: { marginLeft: 8, fontSize: 14, color: '#888' },
    
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
    tagBadge: { 
        backgroundColor: '#F0F0F0', borderRadius: 4, 
        paddingHorizontal: 8, paddingVertical: 4, 
        marginRight: 6, marginBottom: 6 
    },
    tagText: { color: '#555', fontSize: 12, fontWeight: '500' },
    addressRow: { flexDirection: 'row', alignItems: 'center' },
    addressText: { marginLeft: 4, fontSize: 15, color: '#555', flex: 1 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    infoText: { marginLeft: 10, fontSize: 16, color: '#333', flex: 1 },
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