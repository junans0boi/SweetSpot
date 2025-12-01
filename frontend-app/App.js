import React, { useContext } from 'react'; // ✅ [수정] 잘못된 쉼표 제거
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native'; // ✅ [수정] Text 추가
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { PlacesProvider, PlacesContext } from './src/contexts/PlacesContext';
import AppNavigator from './src/navigation/AppNavigator';

// (RootNavigator 컴포넌트는 그대로)
const RootNavigator = () => {
    const { isLoading } = useContext(PlacesContext);
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF7A00" />
                <Text style={styles.loadingText}>앱 데이터를 불러오는 중...</Text>
            </View>
        );
    }
    return <AppNavigator />;
};

export default function App() {
    return (
        <AuthProvider>
            <PlacesProvider>
                <NavigationContainer>
                    <RootNavigator />
                </NavigationContainer>
            </PlacesProvider>
        </AuthProvider>
    );
}

// (styles는 그대로)
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#888',
    }
});
