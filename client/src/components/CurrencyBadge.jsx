import { formatCurrency } from '../utils/currency';

export default function CurrencyBadge({ amount, country = 'India', size = 'md' }) {
  if (amount === undefined || amount === null) return null;

  const formatted = formatCurrency(amount, country);

  const sizes = {
    sm: { primary: '0.82rem' },
    md: { primary: '1rem' },
    lg: { primary: '1.25rem' },
  };
  const sz = sizes[size] || sizes.md;

  if (amount === 0) {
    return (
      <span style={{ fontWeight: 800, fontSize: sz.primary, color: 'var(--secondary)' }}>
        FREE
      </span>
    );
  }

  return (
    <span style={{ fontWeight: 800, fontSize: sz.primary, color: 'var(--text-main)', lineHeight: 1 }}>
      {formatted}
    </span>
  );
}
