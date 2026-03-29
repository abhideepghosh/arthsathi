import { type SQLiteDatabase } from 'expo-sqlite';
import { Budget } from '../../types/budget';
import { generateId } from '../../utils/validators';

export const getBudget = async (
  db: SQLiteDatabase,
  month: string,
): Promise<Budget | null> => {
  return db.getFirstAsync<Budget>(
    'SELECT * FROM budgets WHERE month = ?',
    [month],
  );
};

export const setBudget = async (
  db: SQLiteDatabase,
  month: string,
  limitAmt: number,
): Promise<string> => {
  const existing = await getBudget(db, month);

  if (existing) {
    await db.runAsync(
      'UPDATE budgets SET limit_amt = ? WHERE month = ?',
      [limitAmt, month],
    );
    return existing.id;
  }

  const id = generateId();
  await db.runAsync(
    'INSERT INTO budgets (id, month, limit_amt, created_at) VALUES (?, ?, ?, ?)',
    [id, month, limitAmt, Date.now()],
  );
  return id;
};

export const getRecentBudgets = async (
  db: SQLiteDatabase,
  limit: number = 3,
): Promise<Budget[]> => {
  return db.getAllAsync<Budget>(
    'SELECT * FROM budgets ORDER BY month DESC LIMIT ?',
    [limit],
  );
};
