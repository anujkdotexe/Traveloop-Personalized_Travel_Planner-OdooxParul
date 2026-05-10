/**
 * CurrencyBadge — Displays foreign cost + live INR equivalent inline
 *
 * Usage:
 *   <CurrencyBadge amount={250} currency="AED" />
 *   → renders: "AED 250" with "~₹5,677" tag beneath
 *
 *   <CurrencyBadge amount={45} currency="USD" size="lg" />
 *   → renders larger with prominent INR display
 *
 * Props:
 *   amount    — number
 *   currency  — "USD" | "AED" | "EUR" | "GBP" | "JPY" | "THB" | "SGD" etc.
 *   size      — "sm" | "md" (default) | "lg"
 *   showLabel — show currency name label (default false)
 */

import { useCurrency, CURRENCY_META } from '../context/CurrencyContext';

export default function CurrencyBadge({ amount, currency = 'USD', size = 'md', showLabel = false }) {
  const { formatDual, ratesLoaded } = useCurrency();

  if (amount === undefined || amount === null) return null;

  const { primary, secondary } = formatDual(amount, currency);
  const meta = CURRENCY_META[currency] || {};

  const sizes = {
    sm: { primary: '0.82rem', secondary: '0.68rem', gap: 2 },
    md: { primary: '1rem',    secondary: '0.75rem', gap: 3 },
    lg: { primary: '1.25rem', secondary: '0.85rem', gap: 4 },
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: sz.gap }}>
      {showLabel && meta.name && (
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
          {meta.name}
        </span>
      )}
      <span style={{ fontWeight: 800, fontSize: sz.primary, color: 'var(--text-main)', lineHeight: 1 }}>
        {primary}
      </span>
      {secondary && ratesLoaded && (
        <span style={{ fontSize: sz.secondary, fontWeight: 600, color: 'var(--secondary)', lineHeight: 1, background: 'var(--secondary-light)', padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap' }}>
          {secondary}
        </span>
      )}
    </div>
  );
}
