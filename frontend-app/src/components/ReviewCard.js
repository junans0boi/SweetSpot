import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, SafeAreaView, Alert, ActionSheetIOS, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

// onEdit, onDelete props 추가
export default function ReviewCard({ review, onEdit, onDelete }) {
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);

    const processedPhotoUrls = useMemo(() => {
        const rawUrls = review.photoUrls;
        if (!rawUrls) return [];

        let urlArray = [];
        if (Array.isArray(rawUrls)) {
            // 쪼개진 문자열 처리 등 기존 로직 유지
            if (rawUrls.length > 10 && rawUrls[0].length === 1) {
                const joined = rawUrls.join('');
                if (joined.includes('||')) urlArray = joined.split('||');
                else urlArray = joined.replace(/[\[\]"]/g, '').split(',');
            } else {
                urlArray = rawUrls;
            }
        } else if (typeof rawUrls === 'string') {
            let cleaned = rawUrls.replace(/[\[\]"]/g, '').trim();
            if (cleaned.includes('||')) urlArray = cleaned.split('||');
            else urlArray = cleaned.split(',');
        }

        return urlArray
            .map(url => (typeof url === 'string' ? url.trim() : ''))
            .filter(url => url.startsWith('http'));
    }, [review.photoUrls]);

    const openImageModal = (url) => {
        setSelectedImageUrl(url);
        setModalVisible(true);
    };

    const closeImageModal = () => {
        setModalVisible(false);
        setSelectedImageUrl(null);
    };

    // ✅ 메뉴 버튼 핸들러
    const handleMenuPress = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['취소', '수정하기', '삭제하기'],
                    destructiveButtonIndex: 2,
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) onEdit(review);
                    if (buttonIndex === 2) onDelete(review.id);
                }
            );
        } else {
            Alert.alert(
                "리뷰 관리",
                "작업을 선택해주세요.",
                [
                    { text: "수정하기", onPress: () => onEdit(review) },
                    { text: "삭제하기", onPress: () => onDelete(review.id), style: "destructive" },
                    { text: "취소", style: "cancel" },
                ]
            );
        }
    };

    return (
        <View style={styles.card}>
            {/* 헤더 영역 (작성자 정보 + 메뉴 버튼) */}
            <View style={styles.headerRow}>
                <View style={styles.authorContainer}>
                    <Text style={styles.authorName}>{review.authorName}</Text>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>
                            {review.rating ? review.rating.toFixed(1) : '0.0'}
                        </Text>
                    </View>
                </View>

                {/* ✅ [수정] isOwner -> owner 로 변경 */}
                {review.owner && (
                    <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.reviewText}>{review.text}</Text>

            {processedPhotoUrls.length > 0 && (
                <FlatList
                    data={processedPhotoUrls}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => openImageModal(item)}>
                            <Image
                                source={{ uri: item }}
                                style={styles.reviewImage}
                                contentFit="cover"
                                transition={500}
                            />
                        </TouchableOpacity>
                    )}
                    style={{ marginTop: 10 }}
                />
            )}

            {/* 이미지 전체화면 모달 (기존 유지) */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeImageModal}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={closeImageModal}>
                        <Ionicons name="close" size={30} color="white" />
                    </TouchableOpacity>
                    <View style={styles.fullImageContainer}>
                        <Image
                            source={{ uri: selectedImageUrl }}
                            style={styles.fullImage}
                            contentFit="contain"
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eee'
    },
    // ✅ 헤더 레이아웃 변경
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorName: {
        fontSize: 15,
        fontWeight: 'bold',
        marginRight: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 5,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 13,
        fontWeight: 'bold',
    },
    menuButton: {
        padding: 4,
    },
    reviewText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#444',
    },
    reviewImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#e0e0e0',
    },
    modalContainer: { flex: 1, backgroundColor: 'black' },
    closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 1, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
    fullImageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    fullImage: { width: '100%', height: '100%' }
});