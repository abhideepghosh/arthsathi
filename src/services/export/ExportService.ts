import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { type SQLiteDatabase } from 'expo-sqlite';
import { Transaction } from '../../types/transaction';
import { Category } from '../../types/category';
import { Budget } from '../../types/budget';

interface ExportPayload {
  format: 'arthsaathi_export';
  version: '1';
  exported_at: number;
  period: { from: number; to: number };
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

export const exportData = async (
  db: SQLiteDatabase,
  from: Date,
  to: Date,
  label: string,
) => {
  const transactions = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE timestamp BETWEEN ? AND ?',
    [from.getTime(), to.getTime()],
  );
  const categories = await db.getAllAsync<Category>('SELECT * FROM categories');
  const budgets = await db.getAllAsync<Budget>('SELECT * FROM budgets');

  const payload: ExportPayload = {
    format: 'arthsaathi_export',
    version: '1',
    exported_at: Date.now(),
    period: { from: from.getTime(), to: to.getTime() },
    transactions,
    categories,
    budgets,
  };

  const filename = `ArthSaathi_${label}.arthsaathi`;
  const path = `${FileSystem.cacheDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(path, JSON.stringify(payload), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await Sharing.shareAsync(path, {
    mimeType: 'application/x-arthsaathi',
    dialogTitle: `Share ${filename}`,
  });
};

export const importData = async (db: SQLiteDatabase): Promise<number> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return 0;

  const content = await FileSystem.readAsStringAsync(result.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const data = JSON.parse(content) as ExportPayload;

  // Validate format and version
  if (data.format !== 'arthsaathi_export') {
    throw new Error('Invalid file format. Expected an ArthSaathi export file.');
  }
  if (data.version !== '1') {
    throw new Error(`Unsupported export version: ${data.version}. This app supports version 1.`);
  }
  if (!Array.isArray(data.transactions) || !Array.isArray(data.categories) || !Array.isArray(data.budgets)) {
    throw new Error('Invalid file structure. Missing transactions, categories, or budgets data.');
  }

  // Validate required fields on each transaction
  for (const tx of data.transactions) {
    if (!tx.id || typeof tx.amount !== 'number' || !tx.type || !tx.source || typeof tx.timestamp !== 'number') {
      throw new Error('Invalid transaction data found in export file.');
    }
  }

  let imported = 0;

  await db.withTransactionAsync(async () => {
    for (const cat of data.categories) {
      await db.runAsync(
        'INSERT OR IGNORE INTO categories (id, name, icon, color, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [cat.id, cat.name, cat.icon, cat.color, cat.is_default, cat.created_at],
      );
    }

    for (const budget of data.budgets) {
      await db.runAsync(
        'INSERT OR IGNORE INTO budgets (id, month, limit_amt, created_at) VALUES (?, ?, ?, ?)',
        [budget.id, budget.month, budget.limit_amt, budget.created_at],
      );
    }

    for (const tx of data.transactions) {
      const res = await db.runAsync(
        'INSERT OR IGNORE INTO transactions (id, amount, type, source, merchant, bank, account_last4, raw_sms, category_id, note, timestamp, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [tx.id, tx.amount, tx.type, tx.source, tx.merchant, tx.bank, tx.account_last4, tx.raw_sms, tx.category_id, tx.note, tx.timestamp, tx.created_at],
      );
      if (res.changes > 0) imported++;
    }
  });

  return imported;
};
