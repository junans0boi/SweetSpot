// App.js

import React from 'react';
// NavigationContainer: 모든 내비게이션을 감싸는 최상위 컴포넌트입니다.
import { NavigationContainer } from '@react-navigation/native';
// createStackNavigator: 스택 방식의 내비게이션을 만들어주는 함수입니다.
import { createStackNavigator } from '@react-navigation/stack';

// 우리가 만든 화면들을 모두 불러옵니다.
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import SignupNameScreen from './src/screens/SignupNameScreen';
import SignupTermsScreen from './src/screens/SignupTermsScreen';
import SignupCompleteScreen from './src/screens/SignupCompleteScreen';

// 스택 네비게이터 객체를 생성합니다. 앞으로 이 객체를 사용해 화면을 등록합니다.
const Stack = createStackNavigator();

export default function App() {
  return (
      // NavigationContainer로 전체 앱을 감싸줍니다.
      <NavigationContainer>
        {/* Stack.Navigator가 실제 화면들을 관리하는 본체입니다. */}
        <Stack.Navigator
            // initialRouteName: 앱이 처음 시작될 때 보여줄 화면의 이름을 지정합니다.
            initialRouteName="Login"
            // screenOptions: 모든 화면에 공통적으로 적용될 옵션입니다.
            screenOptions={{
              headerShown: false // 모든 화면의 상단 헤더(제목 표시줄)를 숨깁니다.
            }}
        >
          {/* Stack.Screen 으로 앱에서 사용할 화면들을 등록합니다. */}
          {/* name: 화면의 별명(고유해야 함), component: 해당 별명과 연결될 실제 컴포넌트 */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="SignupName" component={SignupNameScreen} />
          <Stack.Screen name="SignupTerms" component={SignupTermsScreen} />
          <Stack.Screen name="SignupComplete" component={SignupCompleteScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}