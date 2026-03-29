import { useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Budget } from '../types/budget';
import { getBudget, setBudget as setBudgetDb, getRecentBudgets } from '../services/db/budgetQueries';
import { getMonthlySpending } from '../services/db/transactionQueries';
import { getCurrentMonth } from '../utils/dateHelpers';

export const useBudget = () => {
  const db = useSQLiteContext();
  const [budget, setBudgetState] = useState<Budget | null>(null);
  const [spent, setSpent] = useState(0);
  const [recentBudgets, setRecentBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const month = getCurrentMonth();

  const refresh = useCallback(async () => {
    setLoading(true);
    const [currentBudget, currentSpent, recent] = await Promise.all([
      getBudget(db, month),
      getMonthlySpending(db, month),
      getRecentBudgets(db, 3),
    ]);
    setBudgetState(currentBudget);
    setSpent(currentSpent);
    setRecentBudgets(recent);
    setLoading(false);
  }, [db, month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setBudget = useCallback(
    async (limitAmt: number) => {
      await setBudgetDb(db, month, limitAmt);
      refresh();
    },
    [db, month, refresh],
  );

  const ratio = budget && budget.limit_amt > 0 ? spent / budget.limit_amt : 0;
  const isOverBudget = ratio > 1;
  const isNearBudget = ratio >= 0.9 && ratio <= 1;

  return {
    budget,
    spent,
    ratio,
    isOverBudget,
    isNearBudget,
    recentBudgets,
    loading,
    refresh,
    setBudget,
  };
};
