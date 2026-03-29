import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, ListDashes, ChartBar, Wallet, GearSix } from 'phosphor-react-native';
import { TabParamList } from './navigationTypes';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/Home/HomeScreen';
import TransactionsScreen from '../screens/Transactions/TransactionsScreen';
import AnalyticsScreen from '../screens/Analytics/AnalyticsScreen';
import BudgetScreen from '../screens/Budget/BudgetScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.bgPrimary,
          borderTopColor: colors.bgTertiary,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <House size={size} color={color} weight="fill" />,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <ListDashes size={size} color={color} weight="fill" />,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <ChartBar size={size} color={color} weight="fill" />,
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} weight="fill" />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <GearSix size={size} color={color} weight="fill" />,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
