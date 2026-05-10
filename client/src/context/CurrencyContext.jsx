/**
 * CurrencyContext — Live exchange rates (INR base)
 *
 * Uses Frankfurter API (https://api.frankfurter.app)
 * — completely free, no API key, ECB-backed daily rates
 * — fetched once per session and cached in localStorage (1-hour TTL)
 *
 * Provides:
 *   rates           — { USD: 0.012, AED: 0.044, EUR: 0.011, ... } (relative to 1 INR)
 *   convertToINR(amount, fromCurrency) → number
 *   formatINR(amount)                  → "₹1,23,456"
 *   formatDual(amount, fromCurrency)   → "AED 250 (~₹5,847)"
 *   ratesLoaded     — boolean
 *   lastUpdated     — timestamp string
 */

import { createContext, useContext, useEffect, useState } from 'react';

const CACHE_KEY  = 'traveloop_fx_rates';
const CACHE_TTL  = 60 * 60 * 1000; // 1 hour in ms

// Supported foreign currencies + their symbols
export const CURRENCY_META = {
  USD: { symbol: '$',   name: 'US Dollar',        flag: 'US' },
  AED: { symbol: 'AED ', name: 'UAE Dirham',       flag: 'AE' },
  EUR: { symbol: '€',   name: 'Euro',              flag: 'EU' },
  GBP: { symbol: '£',   name: 'British Pound',     flag: 'GB' },
  JPY: { symbol: '¥',   name: 'Japanese Yen',      flag: 'JP' },
  THB: { symbol: '฿',   name: 'Thai Baht',         flag: 'TH' },
  SGD: { symbol: 'S$',  name: 'Singapore Dollar',  flag: 'SG' },
  AUD: { symbol: 'A$',  name: 'Australian Dollar', flag: 'AU' },
  CAD: { symbol: 'C$',  name: 'Canadian Dollar',   flag: 'CA' },
  CHF: { symbol: 'CHF ', name: 'Swiss Franc',      flag: 'CH' },
  MYR: { symbol: 'RM ', name: 'Malaysian Ringgit', flag: 'MY' },
  IDR: { symbol: 'Rp ', name: 'Indonesian Rupiah', flag: 'ID' },
};

// Fallback rates (approx INR per 1 unit of foreign currency) — used if API is offline
const FALLBACK_RATES_PER_INR = {
  USD: 0.01199,  // 1 INR = 0.012 USD  →  1 USD = ₹83.4
  AED: 0.04402,  // 1 INR = 0.044 AED  →  1 AED = ₹22.7
  EUR: 0.01102,  // 1 INR = 0.011 EUR  →  1 EUR = ₹90.8
  GBP: 0.00944,  // 1 INR = 0.0094 GBP →  1 GBP = ₹105.9
  JPY: 1.81450,  // 1 INR = 1.81 JPY   →  1 JPY = ₹0.55
  THB: 0.41800,  // 1 INR = 0.418 THB  →  1 THB = ₹2.39
  SGD: 0.01610,  // 1 INR = 0.016 SGD  →  1 SGD = ₹62.1
  AUD: 0.01830,  // 1 INR = 0.018 AUD  →  1 AUD = ₹54.7
  CAD: 0.01630,  // 1 INR = 0.016 CAD  →  1 CAD = ₹61.4
  CHF: 0.01060,  // 1 INR = 0.0106 CHF →  1 CHF = ₹94.5
  MYR: 0.05540,  // 1 INR = 0.055 MYR  →  1 MYR = ₹18.1
  IDR: 194.200,  // 1 INR = 194.2 IDR  →  1 IDR = ₹0.005
};

const CurrencyContext = createContext(null);

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts < CACHE_TTL) return parsed;
  } catch { /* ignore */ }
  return null;
}

function saveCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, ts: Date.now() })); }
  catch { /* ignore */ }
}

export function CurrencyProvider({ children }) {
  const [ratesPerINR, setRatesPerINR] = useState(FALLBACK_RATES_PER_INR);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Offline (fallback)');
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setRatesPerINR(cached.rates);
      setLastUpdated(cached.date);
      setRatesLoaded(true);
      return;
    }

    // Fetch from Frankfurter — base=INR, amounts per 1 INR in each currency
    const currencies = Object.keys(FALLBACK_RATES_PER_INR).join(',');
    fetch(`https://api.frankfurter.app/latest?from=INR&to=${currencies}`)
      .then(r => {
        if (!r.ok) throw new Error('Network response not ok');
        return r.json();
      })
      .then(data => {
        const rates = data.rates || {};
        setRatesPerINR(prev => ({ ...prev, ...rates }));
        setLastUpdated(data.date || new Date().toLocaleDateString('en-IN'));
        setRatesLoaded(true);
        setUsingFallback(false);
        saveCache({ rates: { ...FALLBACK_RATES_PER_INR, ...rates }, date: data.date });
      })
      .catch(() => {
        // Silently fall back to static rates
        setRatesLoaded(true);
        setUsingFallback(true);
        setLastUpdated('Offline (approximate rates)');
      });
  }, []);

  /**
   * Convert amount in `fromCurrency` to INR
   * e.g. convertToINR(250, 'AED') → ~5677
   */
  const convertToINR = (amount, fromCurrency = 'USD') => {
    const fc = fromCurrency.toUpperCase();
    if (fc === 'INR') return amount;
    const ratePerINR = ratesPerINR[fc];
    if (!ratePerINR || ratePerINR === 0) return null;
    return Math.round(amount / ratePerINR);
  };

  /**
   * Format number as Indian Rupees: ₹1,23,456
   */
  const formatINR = (amount) => {
    if (amount === null || amount === undefined) return '';
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  };

  /**
   * Format dual: "AED 250 (~₹5,677)"
   * Returns a JSX-friendly object with both parts for flexible rendering
   */
  const formatDual = (amount, fromCurrency = 'USD') => {
    const sym = CURRENCY_META[fromCurrency]?.symbol || fromCurrency + ' ';
    const inr = convertToINR(amount, fromCurrency);
    const primary = amount === 0 ? 'FREE' : `${sym}${amount}`;
    const secondary = inr && amount > 0 ? `~${formatINR(inr)}` : null;
    return { primary, secondary, inr };
  };

  return (
    <CurrencyContext.Provider value={{ ratesPerINR, ratesLoaded, lastUpdated, usingFallback, convertToINR, formatINR, formatDual }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
