import { ParsedTransaction } from '../../../types/transaction';
import { CARD_DEBIT_PATTERNS, extractAmount, extractMerchant, extractBank } from '../../../constants/smsPatterns';

export const parseCreditCard = (body: string, sender: string): ParsedTransaction | null => {
  if (!/credit\s*card/i.test(body)) return null;

  for (const pattern of CARD_DEBIT_PATTERNS) {
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
          source: 'credit_card',
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
