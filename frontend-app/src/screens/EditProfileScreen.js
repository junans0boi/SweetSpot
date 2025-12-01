import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from '../contexts/AuthContext';

export default function EditProfileScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { authState } = useAuth();
    
    // MyPage에서 넘겨준 기존 정보
    const { userInfo } = route.params || {};

    const [name, setName] = useState(userInfo?.name || '');
    const [image, setImage] = useState(userInfo?.pictureUrl || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 이미지 선택
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('권한 필요', '사진첩 접근 권한이 필요합니다.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // 저장 핸들러
    const handleSave = async () => {
        if (name.trim().length === 0) {
            Alert.alert("알림", "닉네임을 입력해주세요.");
            return;
        }

        setIsSubmitting(true);

        try {
            let finalImageUrl = image;

            // 1. 이미지가 변경되었고, 로컬 파일(file://)인 경우 업로드 수행
            if (image && image.startsWith('file://')) {
                const formData = new FormData();
                const fileName = image.split('/').pop();
                const match = /\.(\w+)$/.exec(fileName);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                formData.append('files', { uri: image, name: fileName, type });

                // 이미지 업로드 API 호출
                const uploadRes = await axios.post(`${API_BASE_URL}/api/images/upload`, formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${authState.accessToken}`
                    },
                });
                
                // 업로드된 URL (배열로 옴)
                if (uploadRes.data && uploadRes.data.length > 0) {
                    finalImageUrl = uploadRes.data[0];
                }
            }

            // 2. 프로필 정보 업데이트 요청
            await axios.put(`${API_BASE_URL}/api/users/me`, 
                { name: name, pictureUrl: finalImageUrl },
                { headers: { 'Authorization': `Bearer ${authState.accessToken}` } }
            );

            Alert.alert("성공", "프로필이 수정되었습니다.", [
                { text: "확인", onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error("프로필 수정 실패:", error);
            Alert.alert("오류", "프로필 수정에 실패했습니다.");
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
                <Text style={styles.headerTitle}>프로필 수정</Text>
                <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
                    <Text style={styles.saveText}>저장</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                    <Image 
                        source={{ uri: image || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' }} 
                        style={styles.profileImage} 
                    />
                    <View style={styles.cameraIconBadge}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>닉네임</Text>
                    <TextInput 
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="닉네임을 입력하세요"
                    />
                </View>
            </View>
            
            {isSubmitting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FF7A00" />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    saveText: { fontSize: 16, color: '#FF7A00', fontWeight: 'bold' },
    content: { padding: 20, alignItems: 'center' },
    imageContainer: { position: 'relative', marginBottom: 30 },
    profileImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee' },
    cameraIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FF7A00', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    inputGroup: { width: '100%' },
    label: { fontSize: 14, color: '#888', marginBottom: 8 },
    input: { borderBottomWidth: 1, borderColor: '#ddd', fontSize: 16, paddingVertical: 8, color: '#333' },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center' }
});