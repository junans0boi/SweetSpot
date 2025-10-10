import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NaverMapView} from '@mj-studio/react-native-naver-map';
import {useAuth} from '../contexts/AuthContext';

const categories = [
    {id: '1', label: '전체', color: '#FF8243', icon: '👤'},
    {id: '2', label: '카페', color: '#FFB347', icon: '☕'},
    {id: '3', label: '데이트', color: '#7289DA', icon: '💑'},
    {id: '4', label: '미식', color: '#45C4B0', icon: '🍽️'},
];

const samplePlaces = [
    {
        id: '1',
        title: 'A 카페',
        rating: 4.3,
        reviews: 21,
        image: require('../../../frontend_Bak/assets/icon.png'),
    },
    {
        id: '2',
        title: '역전 한탑이 믹쪼',
        rating: 4.8,
        reviews: 35,
        image: require('../../../frontend_Bak/assets/icon.png'),
    },
];

const MainScreen = () => {
    const {signOut} = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('전체');

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* 🗺️ 지도 영역 */}
            <NaverMapView
                style={styles.mapArea}
                initialCamera={{
                    latitude: 37.3613,
                    longitude: 126.935,
                    zoom: 15,
                }}
                onInitialized={() => console.log('✅ 네이버 지도 초기화 완료')}
            />

            {/* 🔍 검색 & 필터 */}
            <View style={styles.filterContainer}>
                <TextInput
                    placeholder="장소, 내용 검색..."
                    style={styles.searchInput}
                />
                <View style={styles.categoryRow}>
                    {categories.map((c) => (
                        <TouchableOpacity
                            key={c.id}
                            style={[
                                styles.categoryBtn,
                                selectedCategory === c.label && {
                                    backgroundColor: c.color,
                                },
                            ]}
                            onPress={() => setSelectedCategory(c.label)}
                        >
                            <Text style={styles.categoryIcon}>{c.icon}</Text>
                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategory === c.label && {color: '#fff'},
                                ]}
                            >
                                {c.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 📋 카드 리스트 */}
            <View style={styles.cardListContainer}>
                <FlatList
                    horizontal
                    data={samplePlaces}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({item}) => (
                        <View style={styles.card}>
                            <Image source={item.image} style={styles.cardImage}/>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSubtitle}>
                                ⭐ {item.rating} ({item.reviews} 리뷰)
                            </Text>
                        </View>
                    )}
                />
            </View>

            {/* 🚪 로그아웃 버튼 */}
            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default MainScreen;

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff'},
    mapArea: {flex: 1},
    filterContainer: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: {width: 0, height: 3},
        shadowRadius: 5,
        elevation: 6,
    },
    searchInput: {
        backgroundColor: '#f6f6f6',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 15,
        marginBottom: 10,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    categoryBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 6,
        marginHorizontal: 3,
        backgroundColor: '#fff',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    categoryIcon: {fontSize: 14},
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#444',
    },
    cardListContainer: {
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        paddingHorizontal: 15,
    },
    card: {
        width: 160,
        backgroundColor: '#fff',
        marginRight: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 4,
        overflow: 'hidden',
    },
    cardImage: {width: '100%', height: 100},
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 8,
        marginHorizontal: 10,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#888',
        marginBottom: 10,
        marginHorizontal: 10,
    },
    logoutButton: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        backgroundColor: '#FF6347',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
    },
    logoutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});