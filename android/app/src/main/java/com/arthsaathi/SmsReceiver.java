package com.arthsaathi;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactHost;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SmsReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    Bundle extras = intent.getExtras();
    if (extras == null) return;

    Object[] pdus = (Object[]) extras.get("pdus");
    String format = extras.getString("format");
    if (pdus == null) return;

    ReactContext reactContext = null;
    try {
      ReactHost reactHost = ((ReactApplication) context.getApplicationContext())
          .getReactHost();
      if (reactHost != null) {
        reactContext = reactHost.getCurrentReactContext();
      }
    } catch (Exception e) {
      return;
    }

    if (reactContext == null) return;

    for (Object pdu : pdus) {
      try {
        SmsMessage msg = SmsMessage.createFromPdu((byte[]) pdu, format);
        if (msg == null) continue;

        String body = msg.getMessageBody();
        String sender = msg.getOriginatingAddress();
        if (body == null || sender == null) continue;

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("onSmsReceived", body + "|||" + sender);
      } catch (Exception e) {
        // Skip malformed SMS
      }
    }
  }
}
