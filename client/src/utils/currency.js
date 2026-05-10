const countryToCurrency = {
  'India': '₹',
  'USA': '$',
  'United Kingdom': '£',
  'France': '€',
  'Germany': '€',
  'Japan': '¥',
  'Australia': 'A$',
  'Canada': 'C$',
  'United Arab Emirates': 'AED',
  'Singapore': 'S$',
};

export const getCurrencySymbol = (country) => {
  return countryToCurrency[country] || 'INR'; // Default to INR
};

export const formatCurrency = (amount, country) => {
  const currency = getCurrencySymbol(country);
  return `${currency} ${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
