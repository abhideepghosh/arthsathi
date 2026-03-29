import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import { DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { initDatabase, getSetting, setSetting } from './src/services/db/database';
import { ThemeProvider, ThemePreference } from './src/context/ThemeContext';
import { setupNotificationChannels, requestNotificationPermissions } from './src/services/notifications/NotificationService';
import { startSmsListener, stopSmsListener } from './src/services/sms/SmsListener';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const dbRef = useRef<SQLiteDatabase | null>(null);

  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  const onDbInit = useCallback(async (db: SQLiteDatabase) => {
    try {
      await initDatabase(db);
      dbRef.current = db;
      const savedTheme = await getSetting(db, 'theme');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        setThemePreference(savedTheme);
      }
    } catch (error) {
      console.warn('Database init error:', error);
      dbRef.current = db;
    } finally {
      setDbReady(true);
    }
    setupNotificationChannels().catch(() => {});
    requestNotificationPermissions().catch(() => {});
  }, []);

  // Start SMS listener once DB is ready
  useEffect(() => {
    if (dbReady && dbRef.current) {
      startSmsListener(dbRef.current);
    }
    return () => stopSmsListener();
  }, [dbReady]);

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.container}>
          <SQLiteProvider
            databaseName="arthsaathi.db"
            onInit={onDbInit}
            onError={(error) => {
              console.error('Database open failed:', error);
            }}
          >
            <ThemeProvider
              initialPreference={themePreference}
              onPreferenceChange={async (pref) => {
                setThemePreference(pref);
                if (dbRef.current) {
                  await setSetting(dbRef.current, 'theme', pref);
                }
              }}
            >
              <View style={styles.container} onLayout={onLayoutRootView}>
                <NavigationContainer>
                  {dbReady && <RootNavigator />}
                </NavigationContainer>
                <StatusBar style="auto" />
              </View>
            </ThemeProvider>
          </SQLiteProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
