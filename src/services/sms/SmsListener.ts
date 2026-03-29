import { DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { type SQLiteDatabase } from 'expo-sqlite';
import { SmsParser } from './SmsParser';
import { saveTransaction } from '../db/transactionQueries';
import { sendTransactionNotification, checkBudgetAndNotify } from '../notifications/NotificationService';

let subscription: EmitterSubscription | null = null;

export const startSmsListener = (db: SQLiteDatabase) => {
  // Clean up any existing subscription before creating a new one
  if (subscription) {
    subscription.remove();
    subscription = null;
  }

  subscription = DeviceEventEmitter.addListener('onSmsReceived', async (raw: string) => {
    try {
      const [body, sender] = raw.split('|||');
      if (!body || !sender) return;

      const parsed = SmsParser.parse(body, sender);
      if (!parsed) return;

      // Prevent duplicate transactions from the same SMS
      const existing = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM transactions WHERE raw_sms = ? LIMIT 1',
        [body],
      );
      if (existing) return;

      await saveTransaction(db, parsed);
      await sendTransactionNotification({
        type: parsed.type,
        amount: parsed.amount,
        merchant: parsed.merchant,
      });
      await checkBudgetAndNotify(db);
    } catch (error) {
      console.warn('SMS processing error:', error);
    }
  });
};

export const stopSmsListener = () => {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
};
