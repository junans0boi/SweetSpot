import React, { useContext, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import PlaceCard from '../components/PlaceCard';
import { PlacesContext } from '../contexts/PlacesContext';
import { useFocusEffect } from '@react-navigation/native';

export default function SavedScreen({ navigation }) {
    const { savedPlaces, onToggleSave, refreshPlaces } = useContext(PlacesContext);

    // 화면에 들어올 때마다 최신 데이터 갱신 (선택 사항)
    useFocusEffect(
        useCallback(() => {
            refreshPlaces();
        }, [])
    );

    const handlePlacePress = (place) => {
        navigation.navigate('PlaceDetail', { place });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>찜한 장소</Text>
            </View>
            {savedPlaces && savedPlaces.length > 0 ? (
                <FlatList
                    data={savedPlaces}
                    renderItem={({ item }) => (
                        <PlaceCard
                            item={item}
                            onPress={() => handlePlacePress(item)}
                            isSaved={true} // 여기 있는 건 다 찜한 것들임
                            onToggleSave={onToggleSave}
                        />
                    )}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingTop: 10 }}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>아직 찜한 장소가 없어요.</Text>
                    <Text style={styles.emptySubText}>마음에 드는 장소를 저장해보세요!</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: { paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#555' },
    emptySubText: { fontSize: 14, color: '#888', marginTop: 8 }
});