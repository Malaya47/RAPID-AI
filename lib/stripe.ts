import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe("pk_test_51RMAcLRpIUfdSJVVANyVwKoMeoXCpEjFkFUWdc80g70cud9PGS2sMzkoi48eYBYu9wFVgk96QjsCywvUDfF3sC0p00CEjZ3r4Z");

export const formatAmountForStripe = (amount: number, currency: string): number => {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
}; 