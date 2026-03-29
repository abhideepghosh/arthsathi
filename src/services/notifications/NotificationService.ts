import * as Notifications from 'expo-notifications';
import { type SQLiteDatabase } from 'expo-sqlite';
import { formatINRShort } from '../../utils/formatCurrency';
import { getCurrentMonth } from '../../utils/dateHelpers';
import { Transaction } from '../../types/transaction';
import { getSetting, setSetting } from '../db/database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const setupNotificationChannels = async () => {
  await Notifications.setNotificationChannelAsync('transactions', {
    name: 'Transactions',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('budget_alerts', {
    name: 'Budget Alerts',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
};

export const sendTransactionNotification = async (tx: Pick<Transaction, 'type' | 'amount' | 'merchant'>) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: tx.type === 'debit'
        ? `${formatINRShort(tx.amount)} spent`
        : `${formatINRShort(tx.amount)} received`,
      body: tx.merchant ?? 'Transaction detected',
      sound: true,
    },
    trigger: null,
  });
};

export const checkBudgetAndNotify = async (db: SQLiteDatabase) => {
  const currentMonth = getCurrentMonth();

  const budget = await db.getFirstAsync<{ limit_amt: number }>(
    'SELECT limit_amt FROM budgets WHERE month = ?',
    [currentMonth],
  );
  if (!budget || budget.limit_amt <= 0) return;

  const result = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE type = 'debit'
     AND strftime('%Y-%m', datetime(timestamp / 1000, 'unixepoch')) = ?`,
    [currentMonth],
  );

  const spent = result?.total ?? 0;
  const ratio = spent / budget.limit_amt;

  if (ratio >= 0.9) {
    // Prevent notification spam: only send once per hour
    const lastAlertTs = await getSetting(db, 'last_budget_alert_ts');
    if (lastAlertTs && Date.now() - parseInt(lastAlertTs, 10) < 3600000) return;

    const pct = Math.round(ratio * 100);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Budget Alert',
        body: ratio >= 1
          ? `You have exceeded your ${formatINRShort(budget.limit_amt)} budget by ${formatINRShort(spent - budget.limit_amt)}!`
          : `You have used ${pct}% of your ${formatINRShort(budget.limit_amt)} budget this month`,
        sound: true,
        priority: 'high',
      },
      trigger: null,
    });

    await setSetting(db, 'last_budget_alert_ts', Date.now().toString());
  }
};
