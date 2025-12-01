import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, Platform, TextInput, FlatList, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import PlaceCard from './PlaceCard';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85; // 바텀 시트에서는 카드가 좀 더 커도 됨

const AI_QUESTIONS = [
    { id: 1, text: "안녕하세요! 오늘 누구와 함께 하시나요? 😊", options: ["혼자서 🚶", "친구와 👯‍♀️", "연인과 👩‍❤️‍👨", "가족과 👨‍👩‍👧‍👦", "직장동료 💼"] },
    { id: 2, text: "어떤 분위기를 찾으시나요? ✨", options: ["조용한 🤫", "활기찬/힙한 🔥", "인스타 감성 📸", "가성비 좋은 💸", "고급스러운 🍷"] },
    { id: 3, text: "마지막! 특별히 땡기는 게 있나요? 😋", options: ["맛있는 밥 🍚", "디저트/커피 ☕", "술 한잔 🍺", "재밌는 놀거리 🎮", "상관없음 🤷‍♂️"] }
];

export default function SweetPickModal({ isVisible, onClose, userLocation, savedPlaces, onToggleSave, navigation }) {
    // ... (기존 상태 및 로직 함수들은 동일하게 유지) ...
    const [chatStep, setChatStep] = useState(0);
    const [chatHistory, setChatHistory] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResults, setAiResults] = useState([]);
    const [finalPick, setFinalPick] = useState(null);
    const [manualInput, setManualInput] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const scrollViewRef = useRef();

    useEffect(() => {
        if (isVisible) {
            setChatStep(1);
            setChatHistory([{ type: 'ai', text: AI_QUESTIONS[0].text }]);
            setUserAnswers([]);
            setAiResults([]);
            setFinalPick(null);
            setShowManualInput(false);
            setManualInput('');
        }
    }, [isVisible]);

    useEffect(() => {
        if (isVisible) {
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [chatHistory, isVisible, isAiLoading]);

    const handleOptionSelect = (option) => {
        const newAnswers = [...userAnswers, option];
        setUserAnswers(newAnswers);
        const newHistory = [...chatHistory, { type: 'user', text: option }];
        setChatHistory(newHistory);
        if (chatStep < AI_QUESTIONS.length) {
            setTimeout(() => {
                setChatHistory(prev => [...prev, { type: 'ai', text: AI_QUESTIONS[chatStep].text }]);
                setChatStep(prev => prev + 1);
            }, 600);
        } else {
            setChatStep(4); 
            requestAiRecommendation(newAnswers);
        }
    };

    const handleManualSubmit = () => {
        if (manualInput.trim() === '') return;
        handleOptionSelect(manualInput);
        setManualInput('');
        setShowManualInput(false);
    };

    const requestAiRecommendation = async (answers) => {
        setIsAiLoading(true);
        try {
            const moodString = answers.join(', ');
            const { latitude, longitude } = userLocation || { latitude: 37.5665, longitude: 126.9780 };
            const response = await axios.get(`${API_BASE_URL}/api/sweet-pick/recommend`, {
                params: { lat: latitude, lng: longitude, mood: moodString }
            });
            if (Array.isArray(response.data)) setAiResults(response.data);
            else setAiResults([response.data]);
        } catch (error) {
            console.error(error);
            Alert.alert("오류", "AI 추천을 가져오지 못했어요.");
            onClose();
        } finally {
            setIsAiLoading(false);
        }
    };

    const handlePickForMe = () => {
        if (aiResults.length > 0) {
            const randomIndex = Math.floor(Math.random() * aiResults.length);
            setFinalPick(aiResults[randomIndex]);
        }
    };

    const goToDetail = (place) => {
        onClose();
        navigation.navigate('PlaceDetail', { place });
    };

    // ✅ [수정] slide 애니메이션 사용
    return (
        <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
                
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    style={styles.modalContainer} // 바텀 시트 스타일 적용
                >
                    {/* 헤더 */}
                    <View style={styles.modalHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 22, marginRight: 8 }}>🍬</Text>
                            <Text style={styles.modalTitle}>Sweet Pick</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#555" />
                        </TouchableOpacity>
                    </View>

                    {/* 채팅 컨텐츠 */}
                    <View style={styles.contentArea}>
                        {aiResults.length === 0 ? (
                            <ScrollView 
                                style={styles.chatScrollView} 
                                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                                ref={scrollViewRef}
                            >
                                {chatHistory.map((msg, idx) => (
                                    <View key={idx} style={[styles.chatBubble, msg.type === 'user' ? styles.userBubble : styles.aiBubble]}>
                                        {msg.type === 'ai' && <View style={styles.aiProfileIcon}><Text style={{ fontSize: 14 }}>🤖</Text></View>}
                                        <View style={[styles.bubbleContent, msg.type === 'user' ? styles.userBubbleContent : styles.aiBubbleContent]}>
                                            <Text style={msg.type === 'user' ? styles.userText : styles.aiText}>{msg.text}</Text>
                                        </View>
                                    </View>
                                ))}
                                {isAiLoading && (
                                    <View style={styles.chatBubble}>
                                        <View style={styles.aiProfileIcon}><Text style={{ fontSize: 14 }}>🤖</Text></View>
                                        <View style={styles.aiBubbleContent}>
                                            <ActivityIndicator size="small" color="#FF7A00" />
                                            <Text style={[styles.aiText, { marginLeft: 8 }]}>열심히 찾고 있어요...</Text>
                                        </View>
                                    </View>
                                )}
                            </ScrollView>
                        ) : (
                            <View style={styles.resultContainer}>
                                {!finalPick ? (
                                    <>
                                        <Text style={styles.resultTitle}>🎉 딱 맞는 3곳을 찾았어요!</Text>
                                        <View style={{height: 340}}>
                                            <FlatList
                                                data={aiResults}
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                snapToInterval={CARD_WIDTH + 20}
                                                decelerationRate="fast"
                                                contentContainerStyle={{ paddingHorizontal: 20 }} // 패딩 조정
                                                keyExtractor={(item, index) => index.toString()}
                                                renderItem={({ item }) => (
                                                    <View style={[styles.cardWrapper, { width: CARD_WIDTH }]}>
                                                        <View style={styles.commentBox}>
                                                            <Text style={styles.commentText}>" {item.aiComment} "</Text>
                                                        </View>
                                                        <PlaceCard 
                                                            item={item.place}
                                                            onPress={() => goToDetail(item.place)}
                                                            isSaved={savedPlaces.some(p => p.id === item.place.id)}
                                                            onToggleSave={onToggleSave}
                                                            containerStyle={styles.cardStyle}
                                                        />
                                                    </View>
                                                )}
                                            />
                                        </View>
                                        <TouchableOpacity style={styles.pickButton} onPress={handlePickForMe}>
                                            <Text style={styles.pickButtonIcon}>🎲</Text>
                                            <Text style={styles.pickButtonText}>못 고르겠어요! 골라주세요</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <View style={styles.finalPickWrapper}>
                                        <Text style={styles.resultTitle}>👑 오늘의 Sweet Spot!</Text>
                                        <View style={[styles.cardWrapper, { width: '100%', marginHorizontal: 0 }]}>
                                            <View style={styles.commentBox}>
                                                <Text style={styles.commentText}>" {finalPick.aiComment} "</Text>
                                            </View>
                                            <PlaceCard 
                                                item={finalPick.place}
                                                onPress={() => goToDetail(finalPick.place)}
                                                isSaved={savedPlaces.some(p => p.id === finalPick.place.id)}
                                                onToggleSave={onToggleSave}
                                                containerStyle={styles.cardStyle}
                                            />
                                        </View>
                                        <TouchableOpacity style={styles.retryButton} onPress={() => setFinalPick(null)}>
                                            <Ionicons name="arrow-undo-outline" size={18} color="#888" />
                                            <Text style={styles.retryText}> 다시 3개 보기</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {aiResults.length === 0 && (
                        <View style={styles.inputArea}>
                            {!showManualInput && chatStep > 0 && chatStep <= AI_QUESTIONS.length && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
                                    {AI_QUESTIONS[chatStep - 1].options.map((opt, idx) => (
                                        <TouchableOpacity key={idx} style={styles.optionChip} onPress={() => handleOptionSelect(opt)}>
                                            <Text style={styles.optionText}>{opt}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity style={[styles.optionChip, styles.manualChip]} onPress={() => setShowManualInput(true)}>
                                        <Text style={[styles.optionText, { color: '#FF7A00' }]}>직접 입력</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            )}
                            
                            {showManualInput && (
                                <View style={styles.manualInputRow}>
                                    <TextInput
                                        style={styles.manualInput}
                                        placeholder="답변을 입력해주세요..."
                                        value={manualInput}
                                        onChangeText={setManualInput}
                                        autoFocus
                                        onSubmitEditing={handleManualSubmit}
                                    />
                                    <TouchableOpacity style={styles.submitButton} onPress={handleManualSubmit}>
                                        <Ionicons name="arrow-up" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }, // 하단 정렬
    backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    
    // ✅ 바텀 시트 스타일
    modalContainer: { 
        backgroundColor: '#fff', 
        borderTopLeftRadius: 25, 
        borderTopRightRadius: 25,
        width: '100%', 
        height: '85%', // 화면 높이의 85% 차지
        overflow: 'hidden', 
        elevation: 20, 
        shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.2, shadowRadius: 10 
    },
    modalHeader: { 
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
        padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff' 
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    closeButton: { padding: 5 },

    contentArea: { flex: 1, backgroundColor: '#f9f9f9' },
    chatScrollView: { flex: 1 },
    
    chatBubble: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 15 },
    aiProfileIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFEBDA', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    bubbleContent: { padding: 14, borderRadius: 20, maxWidth: '80%' },
    aiBubbleContent: { backgroundColor: '#fff', borderTopLeftRadius: 4, borderWidth: 1, borderColor: '#eee' },
    userBubbleContent: { backgroundColor: '#FF7A00', borderTopRightRadius: 4 },
    userBubble: { flexDirection: 'row-reverse', alignItems: 'flex-end' },
    aiBubble: { flexDirection: 'row' },
    aiText: { color: '#333', fontSize: 15, lineHeight: 22 },
    userText: { color: '#fff', fontSize: 15, lineHeight: 22 },

    inputArea: { padding: 20, paddingBottom: 40, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    chipsContainer: { flexDirection: 'row', paddingBottom: 10 },
    optionChip: { backgroundColor: '#f5f5f5', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 25, marginRight: 10 },
    manualChip: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#FF7A00' },
    optionText: { color: '#444', fontSize: 15, fontWeight: '600' },
    manualInputRow: { flexDirection: 'row', alignItems: 'center' },
    manualInput: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 25, paddingHorizontal: 20, height: 50, marginRight: 10, fontSize: 16 },
    submitButton: { backgroundColor: '#FF7A00', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },

    resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
    resultTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    
    cardWrapper: {
        marginHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
        elevation: 3,
        shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4,
    },
    cardStyle: {
        marginHorizontal: 0, 
        marginVertical: 0, 
        borderWidth: 0,
        elevation: 0,
        width: '100%' 
    },
    commentBox: {
        backgroundColor: '#FFFAF5', padding: 15, borderRadius: 15, marginBottom: 15,
        borderLeftWidth: 4, borderLeftColor: '#FF7A00'
    },
    commentText: { color: '#555', fontSize: 15, fontStyle: 'italic', lineHeight: 22 },

    pickButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#333',
        paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30, marginTop: 10
    },
    pickButtonIcon: { fontSize: 20, marginRight: 8 },
    pickButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    finalPickWrapper: { width: '100%', paddingHorizontal: 20, alignItems: 'center' },
    retryButton: { flexDirection: 'row', alignItems: 'center', marginTop: 25, padding: 10 },
    retryText: { color: '#888', fontSize: 15, marginLeft: 4 }
});