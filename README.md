# ArthSaathi

**Your personal finance companion that works entirely on your device.**

ArthSaathi is a privacy-first expense tracker for Android that automatically detects financial transactions from your bank SMS notifications — no manual entry needed. Built with React Native and Expo, it runs completely offline with zero data collection.

---

## Features

### Automatic Transaction Detection
ArthSaathi reads financial notifications from your messaging app and automatically extracts transaction details — amount, merchant, bank, and account info. Supports **60+ Indian bank sender IDs** across SBI, HDFC, ICICI, Axis, Kotak, PNB, and many more.

**Supported transaction types:**
- UPI payments (debit & credit)
- Bank transfers (NEFT, RTGS, IMPS)
- Credit & debit card transactions
- ATM withdrawals
- EMI and auto-debit payments

### Budget Tracking
Set monthly budgets and get real-time alerts when you approach your spending limits. Visual progress indicators show exactly where you stand.

### Analytics & Insights
Visualize your spending patterns with interactive charts. Break down expenses by category, track trends over time, and understand where your money goes.

### 20 Built-in Categories
Salary, Food & Dining, Groceries, Transport, Shopping, Entertainment, Utilities, Health, Education, Travel, Rent, Subscriptions, EMI/Loans, Petrol, Investments, Friends, Family, Recharge, Insurance, and Miscellaneous.

### Dark Mode
Full light and dark theme support with a system-follow option. Every color is theme-aware — no hardcoded values anywhere.

### Export & Import
Back up your data as `.arthsaathi` files and restore them on any device. Export by week, month, or year.

---

## Privacy

ArthSaathi is built on a simple principle: **your financial data never leaves your device**.

- All data is stored locally in an on-device SQLite database
- No servers, no cloud, no analytics, no ads, no tracking
- No data is ever transmitted, uploaded, or shared with anyone
- Works entirely offline
- Uses Android's **NotificationListenerService** (not SMS permissions) to read financial notifications — fully Google Play compliant
- You can revoke access anytime from your device Settings

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.83 + Expo SDK 55 (Bare Workflow) |
| Language | TypeScript (strict) |
| Database | expo-sqlite v14 (WAL mode) |
| Navigation | React Navigation 7 (Stack + Bottom Tabs) |
| Animations | React Native Reanimated 4 |
| Charts | Victory Native + Shopify Skia |
| Icons | Phosphor React Native v3 |
| Fonts | Sora, DM Sans, DM Mono |

---

## Architecture

```
src/
├── components/          # Reusable UI components
│   ├── common/          # Card, ErrorBoundary, EmptyState, etc.
│   ├── home/            # BalanceSummary, BudgetProgress
│   └── transactions/    # TransactionCard, TransactionList, CategoryPicker
├── constants/           # Categories, colors, typography, SMS patterns
├── context/             # ThemeContext (light/dark/system)
├── hooks/               # useTransactions, useBudget, useCategories, etc.
├── navigation/          # RootNavigator, TabNavigator, type definitions
├── screens/
│   ├── Analytics/       # Spending charts and breakdowns
│   ├── Budget/          # Monthly budget management
│   ├── Home/            # Dashboard with balance summary
│   ├── Onboarding/      # Privacy consent + notification access setup
│   ├── Settings/        # Preferences, export/import, privacy policy
│   └── Transactions/    # Transaction list + manual add
├── services/
│   ├── db/              # SQLite database, queries (transactions, budgets, categories)
│   ├── export/          # .arthsaathi file export/import
│   ├── notifications/   # Local notification channels and budget alerts
│   └── sms/             # Notification listener, SMS parser, pattern matching
├── types/               # TypeScript type definitions
└── utils/               # Date helpers, currency formatting, validators
```

### How Transaction Detection Works

```
Bank sends SMS  ->  Android posts notification  ->  NotificationListenerService fires
                                                          |
                                    Emits "onSmsReceived" via DeviceEventEmitter
                                                          |
                                    SmsParser.parse() matches against 50+ regex patterns
                                                          |
                                    Saves to SQLite  ->  Sends local notification
                                                          |
                                    Checks budget threshold  ->  Budget alert if needed
```

The notification listener runs as a **system-level service** — it works even when the app is closed, the phone is locked, or after a reboot. No background task management needed.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Android SDK (for local builds) or EAS CLI (for cloud builds)
- An Android device or emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/abhideepghosh/arthsathi.git
cd arthsaathi

# Install dependencies
npm install

# Start Metro dev server
npm start

# Run on Android device/emulator
npm run android
```

### Building for Production

```bash
# Preview APK (for testing)
eas build --platform android --profile preview

# Production AAB (for Play Store)
eas build --platform android --profile production
```

### First Launch

1. Open ArthSaathi on your Android device
2. Review the privacy disclosure on the onboarding screen
3. Tap **"Enable notification access"** — this opens Android Settings
4. Find **ArthSaathi** in the notification access list and enable it
5. That's it — transactions will be detected automatically from now on

---

## Currency

All amounts are formatted using the Indian numbering system (lakhs and crores) via `Intl.NumberFormat('en-IN')`.

---

## License

This project is private and not licensed for redistribution.

---

<p align="center">
  <strong>ArthSaathi</strong> — Your money. Your device. Your privacy.
</p>
