import { useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Transaction, TransactionType } from '../types/transaction';
import {
  getRecentTransactions,
  getTransactionsByPeriod,
  getTransactionsByType,
  getUncategorizedTransactions,
  searchTransactions,
  updateTransactionCategory,
  deleteTransaction,
  getMonthlySpending,
  getMonthlyIncome,
} from '../services/db/transactionQueries';
import { getCurrentMonth } from '../utils/dateHelpers';

export const useTransactions = (limit: number = 50) => {
  const db = useSQLiteContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getRecentTransactions(db, limit);
    setTransactions(data);
    setLoading(false);
  }, [db, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filterByType = useCallback(
    async (type: TransactionType) => {
      setLoading(true);
      const data = await getTransactionsByType(db, type);
      setTransactions(data);
      setLoading(false);
    },
    [db],
  );

  const filterUncategorized = useCallback(async () => {
    setLoading(true);
    const data = await getUncategorizedTransactions(db);
    setTransactions(data);
    setLoading(false);
  }, [db]);

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        refresh();
        return;
      }
      setLoading(true);
      const data = await searchTransactions(db, query);
      setTransactions(data);
      setLoading(false);
    },
    [db, refresh],
  );

  const setCategory = useCallback(
    async (transactionId: string, categoryId: string) => {
      await updateTransactionCategory(db, transactionId, categoryId);
      refresh();
    },
    [db, refresh],
  );

  const remove = useCallback(
    async (transactionId: string) => {
      await deleteTransaction(db, transactionId);
      refresh();
    },
    [db, refresh],
  );

  return {
    transactions,
    loading,
    refresh,
    filterByType,
    filterUncategorized,
    search,
    setCategory,
    remove,
  };
};

export const useMonthlyStats = () => {
  const db = useSQLiteContext();
  const [spending, setSpending] = useState(0);
  const [income, setIncome] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const month = getCurrentMonth();
    const [spent, earned] = await Promise.all([
      getMonthlySpending(db, month),
      getMonthlyIncome(db, month),
    ]);
    setSpending(spent);
    setIncome(earned);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { spending, income, loading, refresh };
};
