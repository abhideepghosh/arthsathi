import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSQLiteContext } from 'expo-sqlite';
import { RootStackParamList } from './navigationTypes';
import { getSetting } from '../services/db/database';
import { useTheme } from '../context/ThemeContext';
import TabNavigator from './TabNavigator';
import PrivacyScreen from '../screens/Onboarding/PrivacyScreen';
import AddTransactionScreen from '../screens/Transactions/AddTransactionScreen';
import PrivacyPolicyScreen from '../screens/Settings/PrivacyPolicyScreen';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const [hasSeenPrivacy, setHasSeenPrivacy] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const val = await getSetting(db, 'has_seen_privacy');
      setHasSeenPrivacy(val === '1');
    };
    check();
  }, [db]);

  if (hasSeenPrivacy === null) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bgPrimary }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={hasSeenPrivacy ? 'MainTabs' : 'Onboarding'}
    >
      <Stack.Screen name="Onboarding" component={PrivacyScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RootNavigator;
