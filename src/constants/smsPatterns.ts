// UPI debit patterns
export const UPI_DEBIT_PATTERNS = [
  // "Rs.500.00 debited from A/c XX1234 for UPI txn"
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:debited|deducted)\s*(?:from|in)\s*(?:A\/c|account|acct)[\s\w]*?(\d{4})\s*(?:for\s*UPI|UPI\s*txn|UPI\s*ref|via\s*UPI)/i,

  // "Your A/c XXXXXXXX1234 is debited with INR 1,500.00 on UPI"
  /(?:A\/c|account|Acct)\s*(?:no\.?\s*)?[X*]*(\d{4})[-\s]*(?:is\s*)?debited\s*(?:with|for|by)\s*(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "Paid Rs 200 to merchant@upi" / "Sent Rs.500 to merchant via UPI"
  /(?:Paid|Sent|Transferred)\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:to|for)\s*([\w\s@.]+?)(?:\s*via\s*UPI|\s*UPI\s*ID|\s*VPA)/i,

  // "UPI/P2P/merchant ref debit" — ICICI format: "for UPI/P2P/412345678901/merchant@ybl"
  /UPI\s*(?:txn|ref|payment|\/P2P|\/P2M)?\s*[:/]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:debited|deducted)/i,

  // SBI UPI: "A/C X3596 debited by 501.00" or "A/c X3596-debited by Rs.218"
  /A\/C\s*(?:X|x|\*{1,})(\d{4})[-\s]*debited\s*by\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,

  // ICICI: "Acct XX6789 debited with Rs 350.00 on 26-Mar-26 for UPI"
  /(?:Acct|A\/c)\s*[X*]*(\d{3,4})[-\s]*debited\s*(?:with|by)\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:on|for)/i,

  // PNB/SBI: "has a debit by UPI of Rs.300.00" / "has a debit by transfer of Rs 236.00"
  /has\s+a\s+debit\s+(?:by\s+(?:UPI|transfer|NEFT|IMPS|RTGS)\s+)?(?:of\s+)?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "Rs 500.00 debited from A/c **1234 on 26-03-26 for UPI" (HDFC alternate)
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:has\s+been\s+)?debited\s*from\s*(?:your\s+)?(?:[\w]+\s+)*(?:A\/c|account|Acct)\s*(?:ending\s*)?(?:no\.?\s*)?[X*]*(\d{3,4})/i,

  // Kotak: "Sent Rs.500.00 from your Kotak Bank AC X2025 to merchant@paytm on 26-03-26"
  /(?:Sent|Paid)\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*from\s*(?:your\s*)?(?:\w+\s+)?(?:Bank\s+)?(?:AC|A\/c|account)\s*[X*]*(\d{4})/i,

  // BOB/BOI: "A/c XX1234 debited Rs.500.00 on 26-Mar-26" (no with/by keyword)
  /(?:A\/c|account|Acct)\s*[X*]*(\d{4})[-\s]*debited\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

];

// UPI credit patterns
export const UPI_CREDIT_PATTERNS = [
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:credited|received)\s*(?:to|in)\s*(?:A\/c|account|acct)[\s\w]*?(\d{4})\s*(?:from|by|via)\s*UPI/i,
  /(?:received|credit)\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*from\s*([\w\s@.]+?)\s*(?:via\s*UPI|UPI)/i,

  // SBI UPI: "A/C X3596 credited by 1000.00" or "A/c X3596-credited by Rs.218"
  /A\/C\s*(?:X|x|\*{1,})(\d{4})[-\s]*credited\s*(?:by|with)\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "A/c XX1234 is credited with Rs.5,000.00 via UPI" (ICICI)
  /(?:A\/c|account|Acct)\s*[X*]*(\d{4})[-\s]*(?:is\s*)?credited\s*(?:with|by)\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "Rs 2,500.00 credited to your A/c XX1234 via UPI"
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*credited\s*to\s*(?:your\s*)?(?:A\/c|account|Acct)\s*(?:ending\s*)?[X*]*(\d{4})/i,

  // Kotak: "Received Rs.200000 in your Kotak Bank AC X2025 from yesbnk5@ybl on 03-03-26"
  /Received\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:in|to)\s*(?:your\s*)?(?:\w+\s+)?(?:Bank\s+)?(?:AC|A\/c|account)\s*[X*]*(\d{4})/i,

  // PhonePe/GPay: "Received Rs.2,000.00 from SENDER_NAME via UPI"
  /Received\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*from\s*/i,

  // BOB/BOI: "A/c XX1234 credited Rs.2,500.00 on 26-Mar-26" (no with/by keyword)
  /(?:A\/c|account|Acct)\s*[X*]*(\d{4})[-\s]*credited\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // Central Bank: "A/c XX6787 credited by Rs. 48325 on 01032026 via UPI"
  /(?:A\/c|account|Acct)\s*[X*]*(\d{4})[-\s]*credited\s*by\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
];

// Bank debit patterns (NEFT/RTGS/IMPS/ATM/Net Banking)
export const BANK_DEBIT_PATTERNS = [
  // "INR 1500.00 debited from A/c XX1234" / "INR 5000 debited from your IndusInd Bank A/c XX1234"
  /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:debited|deducted)\s*from\s*(?:your\s+)?(?:[\w]+\s+)*(?:A\/c|Acct|account|a\/c)\s*(?:ending\s*)?(?:no\.?\s*)?[X*]*(\d{3,4})/i,

  // "A/c XX1234 debited INR 1500.00" / "A/c no. XXXXX1234 is debited for Rs.1500"
  /(?:A\/c|account|Acct)\s*(?:no\.?\s*)?[X*]*(\d{3,4})[-\s]*(?:is\s*)?(?:debited|Dr)\s*(?:(?:with|by|for)\s*)?(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "NEFT/RTGS/IMPS: INR 1500.00 debited"
  /(?:NEFT|RTGS|IMPS)\s*[:/]?\s*(?:INR|Rs\.?|₹)?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:debited|Dr)/i,

  // ATM: "Rs.10,000 withdrawn from your A/c XX5678"
  /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*withdrawn\s*from\s*(?:your\s+)?(?:[\w]+\s+)*(?:A\/c|account|a\/c)\s*(?:ending\s*)?[X*]*(\d{3,4})/i,

  // "INR 35,000.00 withdrawn from a/c XXXX0019 for NET/NEFT"
  /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*withdrawn\s*from\s*(?:a\/c|A\/c|account)\s*[X*\d]*(\d{4})/i,

  // SBI: "has a debit by transfer of Rs 236.00"
  /has\s+a\s+debit\s+(?:by\s+transfer\s+)?(?:of\s+)?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "Rs.2,48,759.00 is debited from A/c XXXX6791 for BillPay/NetBanking"
  /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*is\s*debited\s*from\s*(?:A\/c|account|Acct)\s*[X*]*(\d{4})/i,

  // "Your account has been debited with Rs 5,000.00"
  /(?:account|A\/c|Acct)\s*(?:[X*]*(\d{4}))?\s*has\s+been\s+debited\s+(?:(?:with|by)\s+)?(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "payment of Rs. 46,000 using NEFT"
  /payment\s+of\s+(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:using|via|through)\s*(?:NEFT|RTGS|IMPS|NetBanking)/i,

  // EMI/auto-debit: "EMI of Rs.15,000.00 debited from A/c"
  /(?:EMI|auto[- ]?debit(?:ed)?|e-mandate)\s*(?:of\s+)?(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:debited|deducted)/i,

  // Wallet debit: "Your Apay Wallet balance is debited for INR 33943"
  /(?:Wallet|wallet)\s*(?:balance\s*)?(?:is\s*)?debited\s*(?:for|by|with)\s*(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // Fee debit: "Debit card annual fee of Rs.399.00 has been debited"
  /(?:annual|monthly|quarterly)\s*fee\s*of\s*(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:has\s+been\s+)?debited/i,

  // "Rs.2,000.00 has been debited from your Union Bank A/c XX1234" (Union/Bandhan/others)
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*has\s+been\s+debited\s*from\s*(?:your\s+)?(?:[\w]+\s+)*(?:A\/c|account|Acct)\s*(?:ending\s*)?[X*]*(\d{3,4})/i,

  // SBI "A/C XXXXXXXXXXX Debited INR 295.00" — fully masked or partial masked account
  /(?:A\/[Cc]|account|Acct)\s*[X*\d]*?(\d{3,4})?\s*(?:is\s*)?Debited\s*(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "A/c XX1234 debited Rs.500" (no with/by — BOB, BOI, SIB direct format)
  /(?:A\/c|account|Acct)\s*[X*]*(\d{4})[-\s]*debited\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // Generic: "A/c X1234-debited by Rs.500" (catches any remaining formats with account + debited + amount)
  /(?:A\/c|account|Acct)\s*[X*]*(\d{4})[-\s]*(?:is\s*)?(?:debited|Dr)\s*(?:by|with|for)\s*(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
];

// Bank credit patterns
export const BANK_CREDIT_PATTERNS = [
  // "INR 15,160.00 credited to A/c XX6791" / "INR 10000 credited to your IDFC FIRST Bank A/c XX1234"
  /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:credited|Cr)\s*(?:to|in)\s*(?:your\s+)?(?:[\w]+\s+)*(?:A\/c|account|Acct)\s*(?:ending\s*)?[X*]*(\d{3,4})/i,

  // "A/c XX6791 credited with INR 15,160.00" or "A/c X3596-credited by Rs.218"
  /(?:A\/c|account|Acct)\s*[X*]*(\d{4})[-\s]*(?:credited|Cr)\s*(?:(?:with|by)\s*)?(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "credited by A/c linked to mobile no" (IMPS mobile-linked)
  /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*credited\s*(?:to\s*)?(?:A\/c|account)\s*(?:no\.?\s*)?[X*]*(\d{4})\s*.*?(?:IMPS|NEFT|RTGS)/i,

  // "Your A/c XX1234 is credited with Rs 25,000.00 (NEFT/UTR:...)"
  /(?:A\/c|account|Acct)\s*[X*]*(\d{4})[-\s]*is\s*credited\s*(?:with|by)\s*(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "has been credited to your A/c"
  /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*has\s+been\s+credited\s*(?:to|in)\s*(?:your\s*)?(?:A\/c|account)\s*[X*]*(\d{4})/i,

  // Canara: "has been credited INR Rs.1790.00" (double currency prefix)
  /has\s+been\s+credited\s*(?:INR\s*)?(?:Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "Rs.5,000.00 has been credited to your Union Bank A/c XX1234" (Union/Bandhan/others)
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*has\s+been\s+credited\s*(?:to|in)\s*(?:your\s+)?(?:[\w]+\s+)*(?:A\/c|account|Acct)\s*(?:ending\s*)?[X*]*(\d{3,4})/i,

  // "A/c XX1234 credited Rs.5,000.00" (no with/by — BOB, BOI, SIB direct format)
  /(?:A\/c|account|Acct)\s*[X*]*(\d{4})[-\s]*credited\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "Payment of Rs 248759 was credited to your card ending 12344" (HDFC card credit)
  /(?:Payment|Refund)\s+of\s+(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:was\s+)?credited\s*(?:to\s*)?(?:your\s*)?(?:card|Credit\s*Card|Debit\s*Card)\s*(?:ending\s*)?[X*]*(\d{4})/i,

  // "credited with Rs.5000 on date" (PNB, Indian Bank, IDBI)
  /(?:A\/c|account|Acct)\s*(?:No\.?\s*)?[X*]*(\d{4})\s*(?:is\s*)?credited\s*(?:with|by)\s*(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // Kotak: "Received Rs.200000 in your Kotak Bank AC X2025"
  /Received\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:in|to)\s*(?:your\s*)?(?:\w+\s+)?(?:Bank\s+)?(?:AC|A\/c|account)\s*[X*]*(\d{4})/i,

  // Generic: catches "credited by/with/for Rs.X" with account
  /(?:A\/c|account|Acct)\s*[X*]*(\d{4})[-\s]*(?:is\s*)?(?:credited|Cr)\s*(?:by|with|for)\s*(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
];

// Credit/Debit card patterns
export const CARD_DEBIT_PATTERNS = [
  // "INR 555.00 spent on HDFC Bank Credit Card XX1234 at MERCHANT"
  /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:spent|used|debited|charged)\s*(?:on|at|for)\s*(?:your\s*)?(?:\w+\s+Bank\s+)?(?:credit|debit)?\s*card\s*(?:ending\s*)?(?:XX|x{2,}|\*{2,})?(\d{4})/i,

  // "Card XX5678 used/has been used for Rs.1,299.00 at FLIPKART"
  /card\s*(?:ending\s*)?(?:no\.?\s*)?[X*x]+(\d{4})\s*(?:has\s+been\s+)?(?:used|swiped|charged)\s*(?:for|at)\s*(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "INR 1500.00 at MERCHANT on card XX1234"
  /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:at|for)\s*([\w\s&.,-]+?)\s*on\s*(?:card|cc|dc)\s*[X*x]+(\d{4})/i,

  // ALERT format: "You've spent Rs.555.00 on your HDFC Bank Credit Card XX1234 at MERCHANT"
  /(?:You(?:'ve|'ve| have)\s+)?spent\s*(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:on|at)\s*(?:your\s*)?(?:\w+\s+)?(?:Bank\s+)?(?:credit|debit)?\s*card\s*(?:ending\s*)?[X*x]*(\d{4})/i,

  // "SBI Card XX4321 used for Rs.899.00 at SWIGGY"
  /(?:SBI\s+)?card\s*[X*x]*(\d{4})\s*used\s*for\s*(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // "Transaction of Rs.799.00 done on RBL Bank Credit Card ending 6789"
  /(?:Transaction|Txn)\s+of\s+(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:done|made)\s+on\s+(?:\w+\s+)?(?:Bank\s+)?(?:credit|debit)?\s*card\s*(?:ending\s*)?[X*x]*(\d{4})/i,

  // Citibank: "Your Citibank Credit Card XX1234 has been used for Rs.2,500.00 at AMAZON"
  /(?:Credit|Debit)\s*Card\s*(?:ending\s*)?[X*x]*(\d{4})\s*(?:has\s+been\s+)?used\s*for\s*(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,

  // HDFC card on UPI: "Rs.20.00 has been debited from your HDFC Bank RuPay Credit Card XX7333 to..."
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:has\s+been\s+)?debited\s*from\s*(?:your\s*)?(?:\w+\s+)?(?:Bank\s+)?(?:RuPay\s+)?(?:Credit|Debit)\s*Card\s*(?:ending\s*)?[X*]*(\d{4})/i,

  // "Thank you for making a payment of Rs.3499.00 towards your HDFC Bank Card"
  /payment\s+of\s+(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*towards\s*(?:your\s*)?(?:\w+\s+)?(?:Bank\s+)?(?:Credit\s+|Debit\s+)?Card/i,

  // Generic card spend: "debited/charged Rs.X on your card XX1234"
  /(?:debited|charged)\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:on|from)\s*(?:your\s*)?(?:\w+\s+)?card\s*(?:ending\s*)?[X*x]*(\d{4})/i,
];

// Bank sender IDs (partial match, case-insensitive)
export const BANK_SENDER_IDS = [
  // SBI
  'SBIINB', 'SBIUPI', 'SBIBNK', 'SBICRD', 'SBIPSG', 'SBIYONO', 'ATMSBI', 'SBICARD',
  // HDFC
  'HDFCBK', 'HDFCCC', 'HDFCBA', 'HDFCAL', 'HDFCDC', 'HDFCRD', 'HDFCSM',
  // ICICI
  'ICICIB', 'ICICIS', 'ICICBK', 'ICBANK', 'ICIBNK', 'ICICIR',
  // Axis
  'AXISBK', 'AXISCR', 'AXISIN', 'AXISMF',
  // Kotak
  'KOTAKB', 'KOTAKP', 'KTKREM', 'KOTMAH', 'KOTSEC',
  // PNB
  'PNBSMS', 'PNBCRD', 'PNBUPI',
  // Bank of Baroda
  'BOBTXN', 'BOBUPI', 'BOBBNK', 'BOBSMS', 'BOBCRD',
  // Canara
  'CANBNK', 'CAANBK', 'CANBKS',
  // Union Bank
  'UNIONB', 'UBIBNK', 'UBISMS', 'UBISMS',
  // Others - major banks
  'INDBNK', 'INBUPI',    // Indian Bank
  'YESBNK', 'YESB',      // Yes Bank
  'IDBIBK', 'IDBIDL',    // IDBI
  'CENTBK', 'CNTBNK',    // Central Bank
  'BOIIND', 'BOIBAL',    // Bank of India
  'SCBNK', 'SCBANK',     // Standard Chartered
  'CITIBNK', 'CITIBK',   // Citibank
  'RBLBNK', 'RBLCRD',    // RBL Bank
  'FEDBNK', 'FEDBK',     // Federal Bank
  'AUBANK', 'AUBSMS',    // AU Bank
  // IndusInd
  'INDUSB', 'INDUSA', 'IIBSMS',
  // Bandhan
  'BDNSMS', 'BNDNBK', 'BNDHAN',
  // IDFC First
  'IDFCFB', 'IDFCBK',
  // South Indian Bank
  'SIBSMS', 'SIBPRD',
  // Maharashtra Bank
  'MAHABK', 'MAHBNK',
  // Karnataka Bank
  'KRNBNK', 'KARNTK',
  // Karur Vysya Bank
  'KVBSMS', 'KVBANK',
  // DCB Bank
  'DCBBNK',
  // Dhanlaxmi Bank
  'DHNBNK',
  // Tamilnad Mercantile Bank
  'TMBSMS',
  // City Union Bank
  'CUBSMS',
  // CSB Bank (Catholic Syrian)
  'CSBBNK',
  // Ujjivan Small Finance Bank
  'UJJBNK',
  // Equitas Small Finance Bank
  'EQTBNK',
  // Jana Small Finance Bank
  'JNABNK',
  // Payment banks & wallets
  'PAYTMB', 'PHONEPE', 'GPAY', 'AMAZON', 'MOBIKWIK',
  'JIOBNK', 'AIRBNK',    // Jio, Airtel Payments Bank
  'IPBMSG',               // India Post Payments Bank
  'APAY',                 // Amazon Pay
  'FREECHARGE',           // Freecharge
  'OLAMNK', 'OLAMNY',    // Ola Money
  'SLCBNK',               // Slice
  'FIBBNK',               // Fi Money
  'JUPBNK',               // Jupiter
  'NIOBKNG',              // Niyo
];

// Extract amount from Indian format string (e.g., "1,50,000.50")
export const extractAmount = (raw: string): number => {
  return parseFloat(raw.replace(/,/g, ''));
};

// Try to extract merchant name from SMS body
export const extractMerchant = (sms: string): string | null => {
  const patterns = [
    // SBI UPI: "trf to DIPANNITA GHOSH Refno" or "transfer from HEMASHRI DHAVALA Ref No"
    /(?:trf|transfer)\s+(?:to|from)\s+(.+?)\s+Ref\s*(?:no|No)/i,
    // ICICI UPI: "for UPI/P2P/412345/merchant@ybl" or "for UPI/P2M/merchant"
    /for\s+UPI\/(?:P2P|P2M)\/\d*\/([A-Za-z0-9\s._@-]+?)(?:\.\s|$|\s+IMPS)/i,
    // Kotak: "to merchant@paytm on" or "from sender@ybl on"
    /(?:to|from)\s+([a-zA-Z0-9._-]+@[a-zA-Z]+)\s+on/i,
    // Card: "at MERCHANT on" or "at MERCHANT."
    /\bat\s+([A-Z][A-Za-z0-9\s&.,-]{2,30})(?:\s+on\s|\.\s|$)/,
    // "Transferred to INVESTMENT INTERMEDI" (SBI NEFT)
    /(?:Transferred|transfer(?:red)?)\s+to\s+([A-Za-z][A-Za-z0-9\s&.,-]{2,30})(?:\.\s|$|\s+on\s|\s+Ref|\s+via)/i,
    // Generic "to MERCHANT" (uppercase start, stops at common delimiters)
    /(?:at|to|for)\s+([A-Z][A-Za-z0-9\s&.,-]{2,30})(?:\s+on\s|\s+via\s|\s+Ref|\s+UPI|\s+IMPS|\s+NEFT|\.\s|$|\.)/,
    /(?:merchant|payee):\s*([A-Za-z0-9\s&.,-]{2,30})/i,
    /(?:to\s+VPA|UPI\s*ID)\s*:?\s*([a-zA-Z0-9._-]+@[a-zA-Z]+)/i,
    // "from SENDER_NAME via" (credit messages)
    /from\s+([A-Z][A-Za-z0-9\s&.,-]{2,30})(?:\s+via\s|\s+Ref|\s+UPI|\s+IMPS|\s+NEFT|\.\s|$|\.)/,
  ];
  for (const p of patterns) {
    const m = sms.match(p);
    if (m) return m[1].trim();
  }
  return null;
};

// Try to identify bank name from sender or SMS body
export const extractBank = (sender: string, body: string): string | null => {
  const upperSender = sender.toUpperCase();

  // Check sender first (most reliable) — short keys are safe here since sender IDs are structured
  const senderMap: [string, string][] = [
    ['HDFC', 'HDFC Bank'],
    ['SBI', 'SBI'],
    ['ICICI', 'ICICI Bank'],
    ['AXIS', 'Axis Bank'],
    ['KOTAK', 'Kotak Bank'],
    ['KTK', 'Kotak Bank'],
    ['PNB', 'PNB'],
    ['BOB', 'Bank of Baroda'],
    ['BOI', 'BOI'],
    ['CANBNK', 'Canara Bank'],
    ['CAANBK', 'Canara Bank'],
    ['CANBKS', 'Canara Bank'],
    ['UNION', 'Union Bank'],
    ['UBI', 'Union Bank'],
    ['INDBNK', 'Indian Bank'],
    ['INBUPI', 'Indian Bank'],
    ['YES', 'Yes Bank'],
    ['IDBI', 'IDBI Bank'],
    ['CENT', 'Central Bank'],
    ['CNT', 'Central Bank'],
    ['SCBNK', 'Standard Chartered'],
    ['SCBANK', 'Standard Chartered'],
    ['CITI', 'Citibank'],
    ['RBL', 'RBL Bank'],
    ['FED', 'Federal Bank'],
    ['AUBANK', 'AU Bank'],
    ['AUB', 'AU Bank'],
    ['INDUS', 'IndusInd Bank'],
    ['IIB', 'IndusInd Bank'],
    ['BDN', 'Bandhan Bank'],
    ['BNDN', 'Bandhan Bank'],
    ['BNDHAN', 'Bandhan Bank'],
    ['IDFC', 'IDFC First Bank'],
    ['SIB', 'South Indian Bank'],
    ['MAHA', 'Bank of Maharashtra'],
    ['KRNBNK', 'Karnataka Bank'],
    ['KARNTK', 'Karnataka Bank'],
    ['KVB', 'Karur Vysya Bank'],
    ['DCB', 'DCB Bank'],
    ['DHN', 'Dhanlaxmi Bank'],
    ['TMB', 'Tamilnad Mercantile Bank'],
    ['CUB', 'City Union Bank'],
    ['CSB', 'CSB Bank'],
    ['UJJ', 'Ujjivan SFB'],
    ['EQT', 'Equitas SFB'],
    ['JNA', 'Jana SFB'],
    ['PAYTM', 'Paytm Payments Bank'],
    ['PHONEPE', 'PhonePe'],
    ['GPAY', 'Google Pay'],
    ['APAY', 'Amazon Pay'],
    ['AMAZON', 'Amazon Pay'],
    ['AIRBNK', 'Airtel Payments Bank'],
    ['IPB', 'India Post Payments Bank'],
    ['JIO', 'Jio Payments Bank'],
    ['SLICE', 'Slice'],
    ['FIB', 'Fi Money'],
    ['JUP', 'Jupiter'],
    ['NIYO', 'Niyo'],
  ];

  for (const [key, name] of senderMap) {
    if (upperSender.includes(key)) return name;
  }

  // Fallback: check body with only unambiguous longer keys to avoid false positives
  const upperBody = body.toUpperCase();
  const bodyMap: [string, string][] = [
    ['HDFC BANK', 'HDFC Bank'],
    ['STATE BANK', 'SBI'],
    ['SBI USER', 'SBI'],
    ['ICICI BANK', 'ICICI Bank'],
    ['AXIS BANK', 'Axis Bank'],
    ['KOTAK', 'Kotak Bank'],
    ['PUNJAB NATIONAL', 'PNB'],
    ['BANK OF BARODA', 'Bank of Baroda'],
    ['BANK OF INDIA', 'BOI'],
    ['CANARA BANK', 'Canara Bank'],
    ['UNION BANK', 'Union Bank'],
    ['INDIAN BANK', 'Indian Bank'],
    ['YES BANK', 'Yes Bank'],
    ['IDBI BANK', 'IDBI Bank'],
    ['CENTRAL BANK', 'Central Bank'],
    ['STANDARD CHARTERED', 'Standard Chartered'],
    ['CITIBANK', 'Citibank'],
    ['RBL BANK', 'RBL Bank'],
    ['FEDERAL BANK', 'Federal Bank'],
    ['AU SMALL FINANCE', 'AU Bank'],
    ['INDUSIND', 'IndusInd Bank'],
    ['BANDHAN', 'Bandhan Bank'],
    ['IDFC FIRST', 'IDFC First Bank'],
    ['SOUTH INDIAN BANK', 'South Indian Bank'],
    ['BANK OF MAHARASHTRA', 'Bank of Maharashtra'],
    ['KARNATAKA BANK', 'Karnataka Bank'],
    ['KARUR VYSYA', 'Karur Vysya Bank'],
    ['DCB BANK', 'DCB Bank'],
    ['DHANLAXMI', 'Dhanlaxmi Bank'],
    ['TAMILNAD MERCANTILE', 'Tamilnad Mercantile Bank'],
    ['CITY UNION', 'City Union Bank'],
    ['CATHOLIC SYRIAN', 'CSB Bank'],
    ['CSB BANK', 'CSB Bank'],
    ['UJJIVAN', 'Ujjivan SFB'],
    ['EQUITAS', 'Equitas SFB'],
    ['JANA BANK', 'Jana SFB'],
    ['PAYTM', 'Paytm Payments Bank'],
    ['PHONEPE', 'PhonePe'],
    ['GOOGLE PAY', 'Google Pay'],
    ['AMAZON PAY', 'Amazon Pay'],
    ['AIRTEL PAYMENT', 'Airtel Payments Bank'],
    ['INDIA POST', 'India Post Payments Bank'],
  ];

  for (const [key, name] of bodyMap) {
    if (upperBody.includes(key)) return name;
  }

  return null;
};

const MONTH_MAP: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

// Extract transaction date from SMS body (returns epoch ms or null)
export const extractDateFromSms = (body: string): number | null => {
  // SBI format: "on date 26Mar26" or "on 29Mar26" (ddMMMyy)
  const sbiMatch = body.match(/on\s+(?:date\s+)?(\d{1,2})([A-Za-z]{3})(\d{2,4})/i);
  if (sbiMatch) {
    const day = parseInt(sbiMatch[1], 10);
    const monthIdx = MONTH_MAP[sbiMatch[2].toUpperCase()];
    if (monthIdx !== undefined) {
      let year = parseInt(sbiMatch[3], 10);
      if (year < 100) year += 2000;
      const date = new Date(year, monthIdx, day, 12, 0, 0);
      if (!isNaN(date.getTime())) return date.getTime();
    }
  }

  // ICICI/Kotak format: "on 26-Mar-26" or "on 26-Mar-2026" (dd-Mon-yy or dd-Mon-yyyy)
  const monMatch = body.match(/on\s+(\d{1,2})[-\/]([A-Za-z]{3})[-\/](\d{2,4})/i);
  if (monMatch) {
    const day = parseInt(monMatch[1], 10);
    const monthIdx = MONTH_MAP[monMatch[2].toUpperCase()];
    if (monthIdx !== undefined) {
      let year = parseInt(monMatch[3], 10);
      if (year < 100) year += 2000;
      const date = new Date(year, monthIdx, day, 12, 0, 0);
      if (!isNaN(date.getTime())) return date.getTime();
    }
  }

  // HDFC card: "on 13/Mar/2026" (dd/Mon/yyyy)
  const hdfcCardMatch = body.match(/on\s+(\d{1,2})\/([A-Za-z]{3})\/(\d{4})/i);
  if (hdfcCardMatch) {
    const day = parseInt(hdfcCardMatch[1], 10);
    const monthIdx = MONTH_MAP[hdfcCardMatch[2].toUpperCase()];
    if (monthIdx !== undefined) {
      const year = parseInt(hdfcCardMatch[3], 10);
      const date = new Date(year, monthIdx, day, 12, 0, 0);
      if (!isNaN(date.getTime())) return date.getTime();
    }
  }

  // Generic: "on 26-03-2026" or "on 26/03/2026" (dd-MM-yyyy or dd/MM/yyyy or dd-MM-yy)
  const genericMatch = body.match(/on\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i);
  if (genericMatch) {
    const day = parseInt(genericMatch[1], 10);
    const month = parseInt(genericMatch[2], 10) - 1;
    let year = parseInt(genericMatch[3], 10);
    if (year < 100) year += 2000;
    const date = new Date(year, month, day, 12, 0, 0);
    if (!isNaN(date.getTime())) return date.getTime();
  }

  // Central Bank: "on 01032026" (ddMMYYYY — no separators)
  const noSepMatch = body.match(/on\s+(\d{2})(\d{2})(\d{4})/);
  if (noSepMatch) {
    const day = parseInt(noSepMatch[1], 10);
    const month = parseInt(noSepMatch[2], 10) - 1;
    const year = parseInt(noSepMatch[3], 10);
    const date = new Date(year, month, day, 12, 0, 0);
    if (!isNaN(date.getTime()) && year > 2000) return date.getTime();
  }

  // ISO-like: "2026-03-26" (yyyy-MM-dd) — used in some HDFC card alerts
  const isoMatch = body.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const date = new Date(year, month, day, 12, 0, 0);
    if (!isNaN(date.getTime()) && year > 2000) return date.getTime();
  }

  // "December 16, 2025" or "March 26, 2026" (full month name)
  const fullMonthMatch = body.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s*(\d{4})/i);
  if (fullMonthMatch) {
    const monthIdx = MONTH_MAP[fullMonthMatch[1].toUpperCase().substring(0, 3)];
    if (monthIdx !== undefined) {
      const day = parseInt(fullMonthMatch[2], 10);
      const year = parseInt(fullMonthMatch[3], 10);
      const date = new Date(year, monthIdx, day, 12, 0, 0);
      if (!isNaN(date.getTime())) return date.getTime();
    }
  }

  return null;
};
