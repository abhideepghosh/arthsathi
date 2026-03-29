import { ParsedTransaction, TransactionSource, TransactionType } from '../../types/transaction';
import {
  UPI_DEBIT_PATTERNS,
  UPI_CREDIT_PATTERNS,
  BANK_DEBIT_PATTERNS,
  BANK_CREDIT_PATTERNS,
  CARD_DEBIT_PATTERNS,
  BANK_SENDER_IDS,
  extractAmount,
  extractMerchant,
  extractBank,
  extractDateFromSms,
} from '../../constants/smsPatterns';

const isBankSender = (sender: string): boolean => {
  const upper = sender.toUpperCase();
  return BANK_SENDER_IDS.some((id) => upper.includes(id));
};

// When reading via notification listener, the sender/title may not contain
// the traditional sender ID (e.g. "SBIINB"). Check the SMS body itself for
// financial keywords that strongly indicate a bank transaction SMS.
const looksLikeBankSms = (body: string): boolean => {
  return /(?:debited|credited|withdrawn|transferred|spent|received|UPI|NEFT|RTGS|IMPS|A\/c|account|Acct)\b/i.test(body)
    && /(?:Rs\.?|INR|₹)\s*[\d,]+/.test(body);
};

const tryPatterns = (
  body: string,
  patterns: RegExp[],
): { amount: number; account_last4: string | null } | null => {
  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) {
      // Find the capture group that looks like an amount (has digits, commas, decimal)
      let amount = 0;
      let account_last4: string | null = null;

      for (let i = 1; i < match.length; i++) {
        const val = match[i];
        if (!val) continue;
        if (/^\d{3,4}$/.test(val)) {
          // Exactly 3-4 digits without comma/decimal → account last digits
          // (e.g., "3596" from X3596, "126" from XX126)
          if (!account_last4) account_last4 = val;
          else amount = extractAmount(val); // both slots look like short numbers; second is amount
        } else if (/^[\d,]+(?:\.\d{1,2})?$/.test(val) && val.length > 1) {
          amount = extractAmount(val);
        }
      }

      if (amount > 0) {
        return { amount, account_last4 };
      }
    }
  }
  return null;
};

export const SmsParser = {
  parse(body: string, sender: string): ParsedTransaction | null {
    // Accept if sender matches known bank IDs OR if the body itself
    // looks like a financial SMS (needed for notification listener where
    // the sender/title may not carry the traditional sender ID)
    if (!isBankSender(sender) && !looksLikeBankSms(body)) return null;

    let type: TransactionType;
    let source: TransactionSource;
    let result: { amount: number; account_last4: string | null } | null;

    // 1. Try UPI debit
    result = tryPatterns(body, UPI_DEBIT_PATTERNS);
    if (result) {
      type = 'debit';
      source = 'upi';
      return buildTransaction(body, sender, type, source, result);
    }

    // 2. Try UPI credit
    result = tryPatterns(body, UPI_CREDIT_PATTERNS);
    if (result) {
      type = 'credit';
      source = 'upi';
      return buildTransaction(body, sender, type, source, result);
    }

    // 3. Try card debit
    result = tryPatterns(body, CARD_DEBIT_PATTERNS);
    if (result) {
      type = 'debit';
      // Determine credit vs debit card from SMS content
      const isCredit = /credit\s*card/i.test(body);
      source = isCredit ? 'credit_card' : 'debit_card';
      return buildTransaction(body, sender, type, source, result);
    }

    // 4. Try bank debit (NEFT/RTGS/IMPS/general)
    result = tryPatterns(body, BANK_DEBIT_PATTERNS);
    if (result) {
      type = 'debit';
      source = 'bank';
      return buildTransaction(body, sender, type, source, result);
    }

    // 5. Try bank credit
    result = tryPatterns(body, BANK_CREDIT_PATTERNS);
    if (result) {
      type = 'credit';
      source = 'bank';
      return buildTransaction(body, sender, type, source, result);
    }

    return null;
  },
};

function buildTransaction(
  body: string,
  sender: string,
  type: TransactionType,
  source: TransactionSource,
  result: { amount: number; account_last4: string | null },
): ParsedTransaction {
  return {
    amount: result.amount,
    type,
    source,
    merchant: extractMerchant(body),
    bank: extractBank(sender, body),
    account_last4: result.account_last4,
    raw_sms: body,
    timestamp: extractDateFromSms(body) ?? undefined,
  };
}
