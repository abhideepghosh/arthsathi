package com.arthsaathi;

import android.content.ComponentName;
import android.content.Intent;
import android.provider.Settings;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Set;

/**
 * Native module exposing notification listener access status and settings intent
 * to the React Native layer.
 */
public class NotificationAccessModule extends ReactContextBaseJavaModule {

    NotificationAccessModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "NotificationAccess";
    }

    /**
     * Check if our NotificationListenerService has been granted access.
     */
    @ReactMethod
    public void isEnabled(Promise promise) {
        try {
            Set<String> enabledListeners = NotificationManagerCompat
                .getEnabledListenerPackages(getReactApplicationContext());
            boolean enabled = enabledListeners.contains(
                getReactApplicationContext().getPackageName()
            );
            promise.resolve(enabled);
        } catch (Exception e) {
            promise.resolve(false);
        }
    }

    /**
     * Open the system notification listener settings screen so the user can
     * enable our service.
     */
    @ReactMethod
    public void openSettings(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("OPEN_SETTINGS_FAILED", e.getMessage());
        }
    }
}
