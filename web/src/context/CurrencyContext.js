import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FALLBACK_RATES, CURRENCY_SYMBOLS } from '../utils/api';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState(FALLBACK_RATES);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(data => data.rates && setRates({ ...FALLBACK_RATES, ...data.rates }))
      .catch(() => {});
  }, []);

  const format = useCallback((usdAmount) => {
    const converted = usdAmount * (rates[currency] || 1);
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    if (converted >= 1_000_000) return `${symbol}${(converted / 1_000_000).toFixed(1)}M`;
    if (converted >= 1_000) return `${symbol}${Math.round(converted).toLocaleString()}`;
    return `${symbol}${converted.toFixed(2)}`;
  }, [currency, rates]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, format, symbols: CURRENCY_SYMBOLS }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
