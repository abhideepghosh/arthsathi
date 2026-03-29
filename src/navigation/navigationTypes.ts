import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<TabParamList>;
  AddTransaction: undefined;
  PrivacyPolicy: undefined;
};

export type TabParamList = {
  Home: undefined;
  Transactions: undefined;
  Analytics: undefined;
  Budget: undefined;
  Settings: undefined;
};
