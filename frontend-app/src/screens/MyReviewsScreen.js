import React, { useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import ReviewCard from '../components/ReviewCard';

export default function MyReviewsScreen() {
    const navigation = useNavigation();
    const { authState } = useAuth();
    const [reviews, setReviews] = useState([]);

    useFocusEffect(
        useCallback(() => {
            axios.get(`${API_BASE_URL}/api/reviews/me`, {
                headers: { 'Authorization': `Bearer ${authState.accessToken}` }
            })
            .then(res => setReviews(res.data.content))
            .catch(err => console.error(err));
        }, [])
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
             <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{padding:10}}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>내가 쓴 리뷰</Text>
            </View>
            <FlatList
                data={reviews}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                    <View style={{paddingHorizontal: 15}}>
                        <Text style={styles.placeName}>📍 {item.placeName || '가게 이름'}</Text>
                        <ReviewCard 
                            review={item} 
                            // 수정/삭제 핸들러 추가 가능
                        />
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.empty}>작성한 리뷰가 없습니다.</Text>}
            />
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
    title: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    placeName: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#FF7A00' },
    empty: { textAlign: 'center', marginTop: 50, color: '#888' }
});