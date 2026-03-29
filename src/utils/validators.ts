export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && isFinite(amount) && amount > 0;
};

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
