import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, TextInput, ScrollView, FlatList, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { createReview, updateReview } from '../api/reviewService';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { PlacesContext } from '../contexts/PlacesContext'; // ✅ Context 임포트 추가
const StarRating = ({ rating, onRate }) => (
    <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => onRate(star)}>
                <Ionicons
                    name={rating >= star ? 'star' : 'star-outline'}
                    size={40}
                    color={rating >= star ? '#FFD700' : '#ccc'}
                />
            </TouchableOpacity>
        ))}
    </View>
);

// ✅ 설문 옵션 데이터 (SweetPick AI 질문과 매칭)
const TAG_SURVEY = [
    {
        question: "누구와 함께 가기 좋나요? 👥",
        options: ["혼자", "친구", "연인", "가족", "회식/단체"]
    },
    {
        question: "분위기는 어떤가요? ✨",
        options: ["조용한", "활기찬", "인스타감성", "뷰맛집", "고급진"]
    },
    {
        question: "어떤 점이 좋았나요? 👍",
        options: ["가성비", "친절해요", "맛있어요", "깨끗해요", "주차편리"]
    }
];

export default function WriteReviewScreen() {
    const route = useRoute();
    const navigation = useNavigation();

    const { placeName, placeId, review } = route.params;
    const isEditMode = !!review;

    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [images, setImages] = useState([]);

    // ✅ 태그 상태 관리
    const [selectedTags, setSelectedTags] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { refreshPlaces } = React.useContext(PlacesContext);
    // 수정 모드 초기값 세팅
    useEffect(() => {
        if (isEditMode && review) {
            setRating(review.rating);
            setReviewText(review.text);

            // 이미지 복원 (기존 로직)
            let initialImages = [];
            const rawUrls = review.photoUrls;
            if (Array.isArray(rawUrls)) initialImages = rawUrls;
            else if (typeof rawUrls === 'string') initialImages = rawUrls.split(','); // 간단 처리
            setImages(initialImages.filter(url => url && url.startsWith('http')));

            // ✅ 태그 복원
            if (review.tags && Array.isArray(review.tags)) {
                setSelectedTags(review.tags);
            }
        }
    }, [isEditMode, review]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('권한 필요', '사진첩 접근 권한이 필요합니다.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 5 - images.length,
        });
        if (!result.canceled) {
            setImages([...images, ...result.assets.map(asset => asset.uri)]);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // ✅ 태그 토글 함수
    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
            if (selectedTags.length >= 5) {
                Alert.alert("알림", "태그는 최대 5개까지만 선택 가능합니다.");
                return;
            }
            setSelectedTags(prev => [...prev, tag]);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) { Alert.alert('알림', '별점을 선택해주세요.'); return; }
        if (reviewText.trim().length === 0) { Alert.alert('알림', '리뷰 내용을 입력해주세요.'); return; }
        // 태그 선택 권장 (필수는 아니지만)
        // if (selectedTags.length === 0) { ... }

        setIsSubmitting(true);

        try {
            let uploadedPhotoUrls = [];
            const existingUrls = images.filter(url => url.startsWith('http'));
            const newFiles = images.filter(url => !url.startsWith('http'));

            if (newFiles.length > 0) {
                const formData = new FormData();
                newFiles.forEach((imageUri) => {
                    const fileName = imageUri.split('/').pop();
                    const match = /\.(\w+)$/.exec(fileName);
                    const type = match ? `image/${match[1]}` : `image/jpeg`;
                    formData.append('files', { uri: imageUri, name: fileName, type: type });
                });

                const uploadResponse = await axios.post(`${API_BASE_URL}/api/images/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                uploadedPhotoUrls = uploadResponse.data;
            }

            const finalPhotoUrls = [...existingUrls, ...uploadedPhotoUrls];

            const reviewData = {
                placeId: placeId,
                rating: rating,
                text: reviewText,
                photoUrls: finalPhotoUrls,
                tags: selectedTags // ✅ 태그 데이터 전송
            };

            if (isEditMode) {
                await updateReview(review.id, reviewData);
                Alert.alert('성공', '리뷰가 수정되었습니다.', [{
                    text: '확인',
                    onPress: () => {
                        refreshPlaces(); // ✅ [추가] 데이터 갱신
                        navigation.goBack();
                    }
                }]);
            } else {
                await createReview(reviewData);
                Alert.alert('성공', '리뷰가 등록되었습니다.', [{
                    text: '확인',
                    onPress: () => {
                        refreshPlaces(); // ✅ [추가] 데이터 갱신
                        navigation.goBack();
                    }
                }]);
            }
        } catch (error) {
            console.error("리뷰 제출 실패:", error);
            Alert.alert('오류', '요청 처리에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditMode ? '리뷰 수정' : '리뷰 작성'}</Text>
                <TouchableOpacity
                    style={[styles.submitButton, (rating === 0 || reviewText.trim().length === 0 || isSubmitting) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitButtonText}>{isEditMode ? '수정' : '등록'}</Text>}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.placeName}>{placeName}</Text>
                    <StarRating rating={rating} onRate={setRating} />

                    <TextInput
                        style={styles.textInput}
                        multiline
                        placeholder="이 장소에 대한 솔직한 리뷰를 남겨주세요."
                        value={reviewText}
                        onChangeText={setReviewText}
                    />

                    {/* ✅ 태그 설문 섹션 */}
                    <View style={styles.surveySection}>
                        <Text style={styles.sectionTitle}>이 장소, 어떠셨나요? (선택)</Text>
                        {TAG_SURVEY.map((item, idx) => (
                            <View key={idx} style={styles.surveyGroup}>
                                <Text style={styles.surveyQuestion}>{item.question}</Text>
                                <View style={styles.tagContainer}>
                                    {item.options.map(tag => (
                                        <TouchableOpacity
                                            key={tag}
                                            style={[
                                                styles.tagChip,
                                                selectedTags.includes(tag) && styles.tagChipSelected
                                            ]}
                                            onPress={() => toggleTag(tag)}
                                        >
                                            <Text style={[
                                                styles.tagText,
                                                selectedTags.includes(tag) && styles.tagTextSelected
                                            ]}>
                                                {tag}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.photoSection}>
                        <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                            <Ionicons name="camera-outline" size={28} color="#555" />
                            <Text style={styles.addPhotoButtonText}>사진 추가 ({images.length}/5)</Text>
                        </TouchableOpacity>
                        <FlatList
                            horizontal
                            data={images}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => (
                                <View>
                                    <Image source={{ uri: item }} style={styles.thumbnail} />
                                    <TouchableOpacity style={styles.deleteImageButton} onPress={() => removeImage(index)}>
                                        <Ionicons name="close-circle" size={20} color="black" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    submitButton: { backgroundColor: '#FF7A00', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, minWidth: 60, alignItems: 'center' },
    submitButtonDisabled: { backgroundColor: '#ccc' },
    submitButtonText: { color: '#fff', fontWeight: 'bold' },
    container: { padding: 20, paddingBottom: 50 },
    placeName: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    starContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
    textInput: { height: 120, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 15, textAlignVertical: 'top', fontSize: 16, lineHeight: 22, marginBottom: 20 },

    // ✅ 설문 스타일
    surveySection: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    surveyGroup: { marginBottom: 15 },
    surveyQuestion: { fontSize: 14, color: '#666', marginBottom: 8 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    tagChip: {
        backgroundColor: '#f5f5f5', paddingVertical: 8, paddingHorizontal: 14,
        borderRadius: 20, marginRight: 8, marginBottom: 8,
        borderWidth: 1, borderColor: 'transparent'
    },
    tagChipSelected: {
        backgroundColor: '#FFF0E6', borderColor: '#FF7A00'
    },
    tagText: { color: '#555', fontSize: 13 },
    tagTextSelected: { color: '#FF7A00', fontWeight: 'bold' },

    photoSection: { marginTop: 10 },
    addPhotoButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 15, justifyContent: 'center', borderStyle: 'dashed' },
    addPhotoButtonText: { marginLeft: 8, fontSize: 16, color: '#555' },
    thumbnail: { width: 80, height: 80, borderRadius: 10, marginTop: 10, marginRight: 10 },
    deleteImageButton: { position: 'absolute', top: 5, right: 5, backgroundColor: 'white', borderRadius: 10 }
});