import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import TodayScreen from '../screens/TodayScreen';
import AddHabitScreen from '../screens/AddHabitScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Today"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196f3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="Today"
          component={TodayScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddHabit"
          component={AddHabitScreen}
          options={{
            title: 'Add Habit',
          }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

