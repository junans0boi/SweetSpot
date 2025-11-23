import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import PlaceCard from '../components/PlaceCard';

import { PlacesContext } from '../contexts/PlacesContext';

// 2. props에서 중복 선언된 savedPlaces를 제거합니다.
export default function SavedScreen({ navigation }) {
    // 이제 Context에서만 savedPlaces와 onToggleSave를 가져옵니다.
    const { savedPlaces, onToggleSave } = useContext(PlacesContext);

    const handlePlacePress = (place) => {
        navigation.navigate('홈', { selectedPlace: place });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>저장한 장소</Text>
            </View>
            {savedPlaces && savedPlaces.length > 0 ? (
                <FlatList
                    data={savedPlaces}
                    renderItem={({ item }) => (
                        <PlaceCard
                            item={item}
                            onPress={() => handlePlacePress(item)}
                            isSaved={true} // 이 화면의 장소는 항상 저장된 상태
                            onToggleSave={onToggleSave}
                        />
                    )}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingTop: 10 }}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>아직 저장한 장소가 없어요.</Text>
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

