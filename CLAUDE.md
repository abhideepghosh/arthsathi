# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies (always use legacy-peer-deps via .npmrc)
npm install

# Start Metro dev server (requires dev client on device)
npm start                    # or: expo start --dev-client

# Run on Android device/emulator (requires Android SDK locally)
npm run android              # or: expo run:android

# Build preview APK via EAS (no local SDK needed)
eas build --platform android --profile preview

# Build production AAB via EAS
eas build --platform android --profile production

# TypeScript check
npx tsc --noEmit

# Test JS bundle (what EAS runs before Gradle)
npx expo export:embed --eager --platform android --dev false
```

## Architecture

**Expo Bare Workflow** (SDK 55 canary) — not Managed. The `android/` folder is committed and maintained manually. Do not run `npx expo prebuild` — it would overwrite the native notification listener service.

### App Initialization (App.tsx)
Provider stack wraps in this order: `GestureHandlerRootView` → `SQLiteProvider` → `ThemeProvider` → `NavigationContainer`. Splash screen stays visible until fonts (8 variants) AND database are initialized.

### Navigation
Stack-based root with a privacy onboarding gate (`has_seen_privacy` in app_settings table). Main app uses a 5-tab bottom navigator (Home, Transactions, Analytics, Budget, Settings). AddTransaction is presented as a modal. PrivacyPolicy is a stack screen accessible from Settings.

### Database (expo-sqlite v14)
Uses the async API: `openDatabaseAsync`, `getAllAsync`, `runAsync`, `getFirstAsync`, `SQLiteProvider`/`useSQLiteContext`. The old synchronous `db.transaction()` does not exist. WAL mode enabled for concurrent read/write (notification listener writes while UI reads). Four tables: `transactions`, `categories`, `budgets`, `app_settings`.

### Notification-Based Transaction Pipeline
Native `NotificationListener.java` (NotificationListenerService) captures SMS notifications from messaging apps (Google Messages, Samsung Messages, Xiaomi, Oppo, Vivo, etc.) → emits `"onSmsReceived"` via DeviceEventEmitter with `"body|||sender"` format → `SmsParser.parse()` validates the body against bank patterns and financial keywords, then tries pattern groups sequentially (UPI → card → bank) → saves to SQLite → triggers local notification → checks budget threshold. `NotificationAccessModule.java` bridges JS to check/open notification listener settings. **No READ_SMS or RECEIVE_SMS permissions needed** — fully Google Play compliant.

### Native Modules (android/)
| File | Purpose |
|------|---------|
| `NotificationListener.java` | NotificationListenerService — captures SMS notifications from messaging apps, emits to RN |
| `NotificationAccessModule.java` | Native module — `isEnabled()` checks access, `openSettings()` opens system settings |
| `NotificationAccessPackage.java` | ReactPackage that registers the native module |
| `MainApplication.kt` | Registers `NotificationAccessPackage` in the package list |

### Theme System
All colors come from `useTheme().colors`. Never hardcode hex values in components. Theme preference (`'light'`/`'dark'`/`'system'`) persists to SQLite `app_settings` table.

### Export Format
Custom `.arthsaathi` files are JSON with `{ format: "arthsaathi_export", version: "1", ... }`. Import uses `INSERT OR IGNORE` to prevent duplicates.

## Project Structure

```
src/
├── components/
│   ├── common/          # Card, ErrorBoundary, EmptyState, AnimatedNumber, etc.
│   ├── home/            # BalanceSummary, BudgetProgress
│   └── transactions/    # TransactionCard, TransactionList, CategoryPicker
├── constants/
│   ├── categories.ts    # 20 default categories with icons and colors
│   ├── colors.ts        # Light/dark color tokens
│   ├── smsPatterns.ts   # 50+ regex patterns, 60+ bank sender IDs
│   └── typography.ts    # Font families, sizes, spacing, border radius
├── context/             # ThemeContext (light/dark/system)
├── hooks/               # useTransactions, useBudget, useCategories, useSmsPermission
├── navigation/          # RootNavigator, TabNavigator, navigationTypes
├── screens/             # Home, Transactions, Analytics, Budget, Settings, Onboarding
├── services/
│   ├── db/              # database.ts, transactionQueries, budgetQueries, categoryQueries
│   ├── export/          # ExportService (.arthsaathi file import/export)
│   ├── notifications/   # NotificationService (channels, transaction alerts, budget alerts)
│   └── sms/             # SmsListener, SmsParser, parsers/ (bank, upi, card)
├── types/               # transaction.ts, budget.ts, category.ts
└── utils/               # dateHelpers, formatCurrency, validators
```

## Critical Implementation Notes

- **expo-file-system**: Import from `expo-file-system/legacy` (not `expo-file-system`) to get `cacheDirectory`, `writeAsStringAsync`, `EncodingType`.
- **expo-notifications**: `NotificationBehavior` requires `shouldShowBanner` and `shouldShowList` (not the deprecated `shouldShowAlert`). `channelId` is not part of `NotificationContentInput` — channels are managed via `setNotificationChannelAsync`.
- **Packages**: Always install via `npx expo install` for Expo-compatible version resolution.
- **Canary versions**: All Expo packages are pinned to `canary-20260327-0789fbc`. Pin exact versions (no `^`) to prevent cross-day canary conflicts.
- **Patches**: `patch-package` fixes applied via postinstall:
  - `@voximplant/react-native-foreground-service`: replaced hard-coded SDK 28 with `safeExtGet`, added `namespace`
- **Gradle**: `android/build.gradle` has a `subprojects` block that forces all libraries to use the root project's compileSdk/minSdk/targetSdk.
- **Currency formatting**: Always use `Intl.NumberFormat('en-IN')` for Indian number system (lakhs/crores, not millions).
- **SMS parser**: Pure TypeScript function with no side effects. Bank sender whitelist has 60+ entries across 12+ Indian banks. Also accepts SMS bodies that match financial keywords (debited/credited/UPI/NEFT etc. + amount pattern) for notification listener where sender ID may differ from traditional sender IDs.
- **Icons**: Use `phosphor-react-native` (requires `react-native-svg`). All 20 category icons (including Wallet, Users, UsersThree, CellSignalFull, ShieldCheck) are mapped in `TransactionCard.tsx` ICON_MAP. When adding new categories, always add the icon to the ICON_MAP.
- **Notification listener vs SMS permissions**: The app uses `NotificationListenerService` (not `READ_SMS`/`RECEIVE_SMS`) to comply with Google Play's Restricted Permissions Policy. The service runs at system level — works when the app is closed, locked, or after reboot. User must enable notification access in Android Settings (not a runtime permission dialog).
- **No prebuild**: Do not run `npx expo prebuild` — it would overwrite `NotificationListener.java`, `NotificationAccessModule.java`, and the manifest service declarations.
