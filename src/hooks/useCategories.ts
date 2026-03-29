import { useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Category } from '../types/category';
import { getAllCategories, createCategory, getCategoryById } from '../services/db/categoryQueries';

export const useCategories = () => {
  const db = useSQLiteContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getAllCategories(db);
    setCategories(data);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCategory = useCallback(
    async (name: string, icon: string, color: string) => {
      await createCategory(db, name, icon, color);
      refresh();
    },
    [db, refresh],
  );

  const getCategory = useCallback(
    async (id: string): Promise<Category | null> => {
      return getCategoryById(db, id);
    },
    [db],
  );

  const categoryMap = categories.reduce<Record<string, Category>>((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {});

  return { categories, categoryMap, loading, refresh, addCategory, getCategory };
};
