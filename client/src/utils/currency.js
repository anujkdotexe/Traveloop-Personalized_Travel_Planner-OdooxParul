const countryToCurrency = {
  'India': 'INR',
  'USA': 'USD',
  'United Kingdom': 'GBP',
  'France': 'EUR',
  'Germany': 'EUR',
  'Japan': 'JPY',
  'Australia': 'AUD',
  'Canada': 'CAD',
  'United Arab Emirates': 'AED',
  'Singapore': 'SGD',
  // Add more as needed
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
