export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatINRShort = (amount: number): string => {
  if (amount >= 1_00_00_000) return `\u20B9${(amount / 1_00_00_000).toFixed(1)}Cr`;
  if (amount >= 1_00_000) return `\u20B9${(amount / 1_00_000).toFixed(1)}L`;
  if (amount >= 1_000) return `\u20B9${(amount / 1_000).toFixed(1)}K`;
  return `\u20B9${amount}`;
};
