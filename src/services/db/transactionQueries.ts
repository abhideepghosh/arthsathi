import { type SQLiteDatabase } from 'expo-sqlite';
import { Transaction, ParsedTransaction, TransactionType } from '../../types/transaction';
import { generateId } from '../../utils/validators';

export const saveTransaction = async (
  db: SQLiteDatabase,
  parsed: ParsedTransaction,
  smsDate?: number,
): Promise<string> => {
  const id = generateId();
  const now = Date.now();
  const timestamp = parsed.timestamp ?? smsDate ?? now;

  await db.runAsync(
    `INSERT INTO transactions (id, amount, type, source, merchant, bank, account_last4, raw_sms, category_id, note, timestamp, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)`,
    [id, parsed.amount, parsed.type, parsed.source, parsed.merchant, parsed.bank, parsed.account_last4, parsed.raw_sms, timestamp, now],
  );

  return id;
};

export const saveManualTransaction = async (
  db: SQLiteDatabase,
  tx: Omit<Transaction, 'id' | 'created_at'>,
): Promise<string> => {
  const id = generateId();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO transactions (id, amount, type, source, merchant, bank, account_last4, raw_sms, category_id, note, timestamp, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, tx.amount, tx.type, tx.source, tx.merchant, tx.bank, tx.account_last4, tx.raw_sms, tx.category_id, tx.note, tx.timestamp, now],
  );

  return id;
};

export const getRecentTransactions = async (
  db: SQLiteDatabase,
  limit: number = 20,
): Promise<Transaction[]> => {
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?',
    [limit],
  );
};

export const getTransactionsByPeriod = async (
  db: SQLiteDatabase,
  from: number,
  to: number,
): Promise<Transaction[]> => {
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
    [from, to],
  );
};

export const getTransactionsByType = async (
  db: SQLiteDatabase,
  type: TransactionType,
  from?: number,
  to?: number,
): Promise<Transaction[]> => {
  if (from !== undefined && to !== undefined) {
    return db.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE type = ? AND timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
      [type, from, to],
    );
  }
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE type = ? ORDER BY timestamp DESC',
    [type],
  );
};

export const getUncategorizedTransactions = async (
  db: SQLiteDatabase,
): Promise<Transaction[]> => {
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE category_id IS NULL ORDER BY timestamp DESC',
  );
};

export const updateTransactionCategory = async (
  db: SQLiteDatabase,
  transactionId: string,
  categoryId: string,
): Promise<void> => {
  await db.runAsync(
    'UPDATE transactions SET category_id = ? WHERE id = ?',
    [categoryId, transactionId],
  );
};

export const deleteTransaction = async (
  db: SQLiteDatabase,
  transactionId: string,
): Promise<void> => {
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [transactionId]);
};

export const getMonthlySpending = async (
  db: SQLiteDatabase,
  month: string,
): Promise<number> => {
  const result = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE type = 'debit'
     AND strftime('%Y-%m', datetime(timestamp / 1000, 'unixepoch')) = ?`,
    [month],
  );
  return result?.total ?? 0;
};

export const getMonthlyIncome = async (
  db: SQLiteDatabase,
  month: string,
): Promise<number> => {
  const result = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE type = 'credit'
     AND strftime('%Y-%m', datetime(timestamp / 1000, 'unixepoch')) = ?`,
    [month],
  );
  return result?.total ?? 0;
};

export const getCategorySpending = async (
  db: SQLiteDatabase,
  from: number,
  to: number,
): Promise<{ category_id: string; total: number; name: string; color: string; icon: string }[]> => {
  return db.getAllAsync(
    `SELECT t.category_id, SUM(t.amount) as total, c.name, c.color, c.icon
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.type = 'debit' AND t.timestamp BETWEEN ? AND ?
     GROUP BY t.category_id
     ORDER BY total DESC`,
    [from, to],
  );
};

export const searchTransactions = async (
  db: SQLiteDatabase,
  query: string,
): Promise<Transaction[]> => {
  const searchTerm = `%${query}%`;
  return db.getAllAsync<Transaction>(
    `SELECT * FROM transactions
     WHERE merchant LIKE ? OR note LIKE ? OR bank LIKE ?
     ORDER BY timestamp DESC LIMIT 50`,
    [searchTerm, searchTerm, searchTerm],
  );
};

export const getDailySpending = async (
  db: SQLiteDatabase,
  from: number,
  to: number,
): Promise<{ date: string; total: number }[]> => {
  return db.getAllAsync(
    `SELECT strftime('%Y-%m-%d', datetime(timestamp / 1000, 'unixepoch')) as date,
            SUM(amount) as total
     FROM transactions
     WHERE type = 'debit' AND timestamp BETWEEN ? AND ?
     GROUP BY date
     ORDER BY date ASC`,
    [from, to],
  );
};

export const deleteAllTransactions = async (db: SQLiteDatabase): Promise<void> => {
  await db.runAsync('DELETE FROM transactions');
};
