export interface DefaultCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { id: 'cat_salary', name: 'Salary', icon: 'Wallet', color: '#2D6A4F' },
  { id: 'cat_food', name: 'Food & Dining', icon: 'ForkKnife', color: '#F4845F' },
  { id: 'cat_groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#52B788' },
  { id: 'cat_transport', name: 'Transport', icon: 'Car', color: '#4895EF' },
  { id: 'cat_shopping', name: 'Shopping', icon: 'Bag', color: '#9D4EDD' },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'FilmSlate', color: '#F72585' },
  { id: 'cat_utilities', name: 'Utilities', icon: 'Lightning', color: '#FFB703' },
  { id: 'cat_health', name: 'Health', icon: 'Heart', color: '#EF233C' },
  { id: 'cat_education', name: 'Education', icon: 'BookOpen', color: '#3A86FF' },
  { id: 'cat_travel', name: 'Travel', icon: 'Airplane', color: '#8338EC' },
  { id: 'cat_rent', name: 'Rent', icon: 'House', color: '#06D6A0' },
  { id: 'cat_subscriptions', name: 'Subscriptions', icon: 'Repeat', color: '#FB8500' },
  { id: 'cat_emi', name: 'EMI / Loans', icon: 'Bank', color: '#E63946' },
  { id: 'cat_petrol', name: 'Petrol', icon: 'GasPump', color: '#40916C' },
  { id: 'cat_investments', name: 'Investments', icon: 'TrendUp', color: '#74C69D' },
  { id: 'cat_friends', name: 'Friends', icon: 'Users', color: '#4CC9F0' },
  { id: 'cat_family', name: 'Family', icon: 'UsersThree', color: '#FF6B6B' },
  { id: 'cat_recharge', name: 'Recharge', icon: 'CellSignalFull', color: '#7209B7' },
  { id: 'cat_insurance', name: 'Insurance', icon: 'ShieldCheck', color: '#0077B6' },
  { id: 'cat_misc', name: 'Miscellaneous', icon: 'DotsThree', color: '#A0A0A0' },
];
