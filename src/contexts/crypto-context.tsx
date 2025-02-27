'use client';

import { createContext, useContext, useEffect, useState } from "react";

interface CryptoPrice {
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface CryptoContextType {
  prices: Record<string, CryptoPrice>;
  isLoading: boolean;
  error: Error | null;
}

const CryptoContext = createContext<CryptoContextType>({
  prices: {},
  isLoading: true,
  error: null,
});

export function CryptoProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');

        if (!response.ok) {
          throw new Error('Failed to fetch prices from Binance');
        }

        const data = await response.json();
        const formattedPrices: Record<string, CryptoPrice> = {};

        data.forEach((item: any) => {
          const symbol = item.symbol.replace('USDT', '');
          formattedPrices[symbol] = {
            symbol,
            current_price: parseFloat(item.lastPrice),
            price_change_percentage_24h: parseFloat(item.priceChangePercent),
          };
        });

        setPrices(formattedPrices);
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CryptoContext.Provider value={{ prices, isLoading, error }}>
      {children}
    </CryptoContext.Provider>
  );
}

export function useCrypto() {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
} 