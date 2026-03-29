import { useState, useEffect, useCallback } from 'react';
import { NativeModules, Platform, AppState } from 'react-native';

const { NotificationAccess } = NativeModules;

export const useSmsPermission = () => {
  const [granted, setGranted] = useState(false);
  const [checked, setChecked] = useState(false);

  const check = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setGranted(false);
      setChecked(true);
      return;
    }

    try {
      const enabled: boolean = await NotificationAccess.isEnabled();
      setGranted(enabled);
    } catch {
      setGranted(false);
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  // Re-check when app comes back to foreground (user may have toggled in Settings)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        check();
      }
    });
    return () => subscription.remove();
  }, [check]);

  const request = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    try {
      await NotificationAccess.openSettings();
      // We can't know the result until user comes back — AppState listener will re-check
      return true;
    } catch {
      return false;
    }
  }, []);

  return { granted, checked, check, request };
};
