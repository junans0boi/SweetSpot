import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import RecommendScreen from '../screens/RecommendScreen';
import SavedScreen from '../screens/SavedScreen';
import MyPageScreen from '../screens/MyPageScreen';
import RestaurantListScreen from '../screens/RestaurantListScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function RecommendStackScreen() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Recommend" component={RecommendScreen} />
            <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
        </Stack.Navigator>
    );
}

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === '홈') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === '추천') iconName = focused ? 'star' : 'star-outline';
                    else if (route.name === '저장') iconName = focused ? 'bookmark' : 'bookmark-outline';
                    else if (route.name === '내 정보') iconName = focused ? 'person' : 'person-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#FF7A00',
                tabBarInactiveTintColor: '#888',
                tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
                tabBarStyle: { height: Platform.OS === 'ios' ? 85 : 65, paddingBottom: Platform.OS === 'ios' ? 30 : 10, paddingTop: 5 }
            })}
        >
            <Tab.Screen name="홈" component={HomeScreen} />
            <Tab.Screen name="추천" component={RecommendStackScreen} />
            <Tab.Screen name="저장" component={SavedScreen} />
            <Tab.Screen name="내 정보" component={MyPageScreen} />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;

