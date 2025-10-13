import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { PlacesProvider } from './src/contexts/PlacesContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    return (
        <AuthProvider>
            <PlacesProvider>
                <NavigationContainer>
                    <AppNavigator />
                </NavigationContainer>
            </PlacesProvider>
        </AuthProvider>
    );
}

