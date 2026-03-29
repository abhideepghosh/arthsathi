import { type SQLiteDatabase } from 'expo-sqlite';
import { DEFAULT_CATEGORIES } from '../../constants/categories';

export const initDatabase = async (db: SQLiteDatabase) => {
  await db.execAsync('PRAGMA journal_mode = WAL;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id            TEXT PRIMARY KEY,
      amount        REAL NOT NULL,
      type          TEXT NOT NULL,
      source        TEXT NOT NULL,
      merchant      TEXT,
      bank          TEXT,
      account_last4 TEXT,
      raw_sms       TEXT,
      category_id   TEXT,
      note          TEXT,
      timestamp     INTEGER NOT NULL,
      created_at    INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      icon       TEXT NOT NULL,
      color      TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id         TEXT PRIMARY KEY,
      month      TEXT NOT NULL UNIQUE,
      limit_amt  REAL NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
  `);

  await seedDefaultCategories(db);
};

const seedDefaultCategories = async (db: SQLiteDatabase) => {
  // Always upsert all default categories to pick up new additions
  const now = Date.now();
  for (const cat of DEFAULT_CATEGORIES) {
    await db.runAsync(
      'INSERT OR IGNORE INTO categories (id, name, icon, color, is_default, created_at) VALUES (?, ?, ?, ?, 1, ?)',
      [cat.id, cat.name, cat.icon, cat.color, now],
    );
  }

  // Remove the old "cat_others" if the new "cat_misc" exists (renamed)
  const miscExists = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM categories WHERE id = 'cat_misc'",
  );
  if (miscExists) {
    await db.runAsync(
      "UPDATE transactions SET category_id = 'cat_misc' WHERE category_id = 'cat_others'",
    );
    await db.runAsync("DELETE FROM categories WHERE id = 'cat_others'");
  }

  await db.runAsync(
    "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('is_seeded', '1')",
  );
};

export const getSetting = async (db: SQLiteDatabase, key: string): Promise<string | null> => {
  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    [key],
  );
  return result?.value ?? null;
};

export const setSetting = async (db: SQLiteDatabase, key: string, value: string): Promise<void> => {
  await db.runAsync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    [key, value],
  );
};
