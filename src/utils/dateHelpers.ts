import { format, isToday, isYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export const getDateLabel = (timestamp: number): string => {
  const date = new Date(timestamp);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
};

export const formatTime = (timestamp: number): string => {
  return format(new Date(timestamp), 'h:mm a');
};

export const formatDate = (timestamp: number): string => {
  return format(new Date(timestamp), 'MMM d, yyyy');
};

export const getCurrentMonth = (): string => {
  return format(new Date(), 'yyyy-MM');
};

export type TimePeriod = 'week' | 'month' | 'year';

export const getPeriodRange = (period: TimePeriod): { from: Date; to: Date } => {
  const now = new Date();
  switch (period) {
    case 'week':
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'year':
      return { from: startOfYear(now), to: endOfYear(now) };
  }
};
