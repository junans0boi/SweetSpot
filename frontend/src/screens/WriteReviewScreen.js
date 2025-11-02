import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

// 별점 선택 컴포넌트
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

export default function WriteReviewScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { placeName, placeId } = route.params;

    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [images, setImages] = useState([]); // 선택된 사진 URI 목록

    // 사진 선택 함수
    const pickImage = async () => {
        // 권한 요청
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('권한 필요', '리뷰에 사진을 첨부하려면 사진첩 접근 권한이 필요합니다.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true, // 여러 장 선택 가능
            quality: 1,
            selectionLimit: 5, // 최대 5장까지
        });

        if (!result.canceled) {
            setImages(result.assets.map(asset => asset.uri));
        }
    };

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert('알림', '별점을 선택해주세요.');
            return;
        }
        if (reviewText.trim().length === 0) {
            Alert.alert('알림', '리뷰 내용을 입력해주세요.');
            return;
        }

        console.log('--- 리뷰 제출 데이터 ---');
        console.log('장소 ID:', placeId);
        console.log('별점:', rating);
        console.log('리뷰 내용:', reviewText);
        console.log('첨부 사진:', images);

        // TODO: 추후 여기에 백엔드 API 연동 로직 추가

        Alert.alert('성공', '리뷰가 성공적으로 등록되었습니다.', [
            { text: '확인', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>리뷰 작성</Text>
                <TouchableOpacity
                    style={[styles.submitButton, (rating === 0 || reviewText.trim().length === 0) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={rating === 0 || reviewText.trim().length === 0}
                >
                    <Text style={styles.submitButtonText}>등록</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
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

                    <View style={styles.photoSection}>
                        <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                            <Ionicons name="camera-outline" size={28} color="#555" />
                            <Text style={styles.addPhotoButtonText}>사진 추가 ({images.length}/5)</Text>
                        </TouchableOpacity>
                        <FlatList
                            horizontal
                            data={images}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => <Image source={{ uri: item }} style={styles.thumbnail} />}
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
    submitButton: { backgroundColor: '#FF7A00', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    submitButtonDisabled: { backgroundColor: '#ccc' },
    submitButtonText: { color: '#fff', fontWeight: 'bold' },
    container: { padding: 20 },
    placeName: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    starContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
    textInput: { height: 150, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 15, textAlignVertical: 'top', fontSize: 16, lineHeight: 22 },
    photoSection: { marginTop: 20 },
    addPhotoButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 15, justifyContent: 'center', borderStyle: 'dashed' },
    addPhotoButtonText: { marginLeft: 8, fontSize: 16, color: '#555' },
    thumbnail: { width: 80, height: 80, borderRadius: 10, marginTop: 10, marginRight: 10 }
});