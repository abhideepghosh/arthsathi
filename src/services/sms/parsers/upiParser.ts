import { ParsedTransaction } from '../../../types/transaction';
import { UPI_DEBIT_PATTERNS, UPI_CREDIT_PATTERNS, extractAmount, extractMerchant, extractBank } from '../../../constants/smsPatterns';

export const parseUpi = (body: string, sender: string): ParsedTransaction | null => {
  // Try debit patterns
  for (const pattern of UPI_DEBIT_PATTERNS) {
    const match = body.match(pattern);
    if (match) {
      let amount = 0;
      let account_last4: string | null = null;

      for (let i = 1; i < match.length; i++) {
        const val = match[i];
        if (!val) continue;
        if (/^[\d,]+(?:\.\d{1,2})?$/.test(val) && val.length > 1) {
          amount = extractAmount(val);
        } else if (/^\d{4}$/.test(val)) {
          account_last4 = val;
        }
      }

      if (amount > 0) {
        return {
          amount,
          type: 'debit',
          source: 'upi',
          merchant: extractMerchant(body),
          bank: extractBank(sender, body),
          account_last4,
          raw_sms: body,
        };
      }
    }
  }

  // Try credit patterns
  for (const pattern of UPI_CREDIT_PATTERNS) {
    const match = body.match(pattern);
    if (match) {
      let amount = 0;
      let account_last4: string | null = null;

      for (let i = 1; i < match.length; i++) {
        const val = match[i];
        if (!val) continue;
        if (/^[\d,]+(?:\.\d{1,2})?$/.test(val) && val.length > 1) {
          amount = extractAmount(val);
        } else if (/^\d{4}$/.test(val)) {
          account_last4 = val;
        }
      }

      if (amount > 0) {
        return {
          amount,
          type: 'credit',
          source: 'upi',
          merchant: extractMerchant(body),
          bank: extractBank(sender, body),
          account_last4,
          raw_sms: body,
        };
      }
    }
  }

  return null;
};
