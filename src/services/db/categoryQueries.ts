import { type SQLiteDatabase } from 'expo-sqlite';
import { Category } from '../../types/category';
import { generateId } from '../../utils/validators';

export const getAllCategories = async (
  db: SQLiteDatabase,
): Promise<Category[]> => {
  return db.getAllAsync<Category>(
    'SELECT * FROM categories ORDER BY is_default DESC, name ASC',
  );
};

export const getCategoryById = async (
  db: SQLiteDatabase,
  id: string,
): Promise<Category | null> => {
  return db.getFirstAsync<Category>(
    'SELECT * FROM categories WHERE id = ?',
    [id],
  );
};

export const createCategory = async (
  db: SQLiteDatabase,
  name: string,
  icon: string,
  color: string,
): Promise<string> => {
  const id = `cat_custom_${generateId()}`;
  await db.runAsync(
    'INSERT INTO categories (id, name, icon, color, is_default, created_at) VALUES (?, ?, ?, ?, 0, ?)',
    [id, name, icon, color, Date.now()],
  );
  return id;
};

export const deleteCategory = async (
  db: SQLiteDatabase,
  id: string,
): Promise<void> => {
  await db.withTransactionAsync(async () => {
    // Only delete custom categories
    await db.runAsync(
      'DELETE FROM categories WHERE id = ? AND is_default = 0',
      [id],
    );
    // Unset category from transactions that had this category
    await db.runAsync(
      'UPDATE transactions SET category_id = NULL WHERE category_id = ?',
      [id],
    );
  });
};
