export type TransactionType = 'debit' | 'credit';
export type TransactionSource = 'upi' | 'bank' | 'credit_card' | 'debit_card' | 'cash' | 'other';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  source: TransactionSource;
  merchant: string | null;
  bank: string | null;
  account_last4: string | null;
  raw_sms: string | null;
  category_id: string | null;
  note: string | null;
  timestamp: number;
  created_at: number;
}

export interface ParsedTransaction {
  amount: number;
  type: TransactionType;
  source: TransactionSource;
  merchant: string | null;
  bank: string | null;
  account_last4: string | null;
  raw_sms: string;
  timestamp?: number;
}
