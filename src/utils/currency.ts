import { Currency } from '../types';

// Approximate VND → USD exchange rate
const VND_TO_USD = 1 / 25500;

/**
 * Convert a VND amount to the target currency
 */
const convert = (amountVND: number, currency: Currency): number => {
  if (currency === 'VND') return amountVND;
  return amountVND * VND_TO_USD;
};

/**
 * Format a VND amount into the selected currency with full precision
 * e.g. 500000 VND → "500,000₫" or "$19.61"
 */
export const formatCurrency = (amountVND: number, currency: Currency): string => {
  if (amountVND === 0) {
    return currency === 'VND' ? '0₫' : '$0';
  }
  const value = convert(amountVND, currency);
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN').format(value) + '₫';
  }
  return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(value));
};

/**
 * Format a VND amount compactly for small spaces
 * VND: 500k, 1.5tr | USD: $20, $1.5K
 */
export const formatCurrencyCompact = (amountVND: number, currency: Currency): string => {
  if (amountVND === 0) {
    return currency === 'VND' ? '0₫' : '$0';
  }
  const value = convert(amountVND, currency);

  if (currency === 'VND') {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace('.0', '')}tr`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return `${value}₫`;
  }

  // USD compact
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1).replace('.0', '')}K`;
  }
  return `$${Math.round(value)}`;
};

/**
 * Format for input display (used in budget input fields)
 */
export const formatCurrencyInput = (amountVND: number, currency: Currency): string => {
  if (amountVND === 0) return '';
  const value = convert(amountVND, currency);
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN').format(value);
  }
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(value));
};

/**
 * Parse user input string back to VND amount
 */
export const parseCurrencyInput = (value: string, currency: Currency): number => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned) || 0;
  if (currency === 'VND') return Math.round(num);
  // Convert USD back to VND
  return Math.round(num / VND_TO_USD);
};

/**
 * Get the currency symbol
 */
export const getCurrencySymbol = (currency: Currency): string => {
  return currency === 'VND' ? '₫' : '$';
};

/**
 * Default currency for a given language
 */
export const getDefaultCurrency = (language: 'vi' | 'en'): Currency => {
  return language === 'vi' ? 'VND' : 'USD';
};
