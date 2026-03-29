package com.arthsaathi;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.app.Notification;
import android.os.Bundle;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactHost;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * System-bound NotificationListenerService that captures incoming SMS notifications
 * from known bank sender IDs and forwards them to React Native for parsing.
 *
 * This replaces the BroadcastReceiver-based SMS approach (READ_SMS / RECEIVE_SMS)
 * to comply with Google Play's Restricted Permissions Policy.
 *
 * Lifecycle: Android binds this service when the user grants notification access
 * in Settings. It persists across app kills and reboots automatically.
 */
public class NotificationListener extends NotificationListenerService {

    // SMS app package names that we read notifications from
    private static final String[] SMS_PACKAGES = {
        "com.google.android.apps.messaging",  // Google Messages
        "com.samsung.android.messaging",       // Samsung Messages
        "com.android.mms",                     // AOSP MMS
        "com.oneplus.mms",                     // OnePlus Messages
        "com.xiaomi.mms",                      // Xiaomi Messages (MIUI)
        "com.miui.mms",                        // Xiaomi Messages (alternate)
        "com.oppo.mms",                        // Oppo Messages
        "com.coloros.mms",                     // ColorOS Messages (Oppo/Realme)
        "com.vivo.mms",                        // Vivo Messages
        "com.iqoo.mms",                        // iQOO Messages
        "com.realme.mms",                      // Realme Messages
        "in.jio.messages",                     // Jio Messages
    };

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null) return;

        String packageName = sbn.getPackageName();
        if (!isSmsApp(packageName)) return;

        Notification notification = sbn.getNotification();
        if (notification == null || notification.extras == null) return;

        Bundle extras = notification.extras;

        // Extract the full SMS text from the notification
        // bigText has the full message; text may be truncated
        CharSequence bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
        CharSequence text = extras.getCharSequence(Notification.EXTRA_TEXT);
        CharSequence title = extras.getCharSequence(Notification.EXTRA_TITLE);

        String body = bigText != null ? bigText.toString() :
                       (text != null ? text.toString() : null);
        String sender = title != null ? title.toString() : "";

        if (body == null || body.isEmpty()) return;

        // Emit to React Native using the same event name and format
        // as the old SmsReceiver for full backward compatibility
        emitToReactNative(body + "|||" + sender);
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        // No action needed — we capture on post, not on removal
    }

    private boolean isSmsApp(String packageName) {
        if (packageName == null) return false;
        for (String pkg : SMS_PACKAGES) {
            if (pkg.equals(packageName)) return true;
        }
        return false;
    }

    private void emitToReactNative(String payload) {
        try {
            ReactHost reactHost = ((ReactApplication) getApplication()).getReactHost();
            if (reactHost == null) return;

            ReactContext reactContext = reactHost.getCurrentReactContext();
            if (reactContext == null) return;

            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onSmsReceived", payload);
        } catch (Exception e) {
            // App may not be running — safe to ignore
        }
    }
}
