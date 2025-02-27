'use client';

import { ArrowDown, ArrowUp, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface CryptoData {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_1h_in_currency: number;
}

interface CryptoPriceTagProps {
  symbol: string;
}

export function CryptoPriceTag({ symbol }: CryptoPriceTagProps) {
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map common symbols to CoinGecko IDs
  const symbolToId: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'DOGE': 'dogecoin',
    // Add more mappings as needed
  };

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const id = symbolToId[symbol.toUpperCase()];
        if (!id) {
          setError('Unsupported token');
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`
        );

        if (!response.ok) throw new Error('Failed to fetch price');

        const data = await response.json();
        setCryptoData({
          id,
          symbol: symbol.toUpperCase(),
          current_price: data[id].usd,
          price_change_percentage_1h_in_currency: data[id].usd_24h_change
        });
      } catch (err) {
        setError('Failed to load price');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
  }, [symbol]);

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted/50 rounded-md">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading...
      </span>
    );
  }

  if (error || !cryptoData) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted/50 rounded-md text-muted-foreground">
        ${symbol.toUpperCase()}
      </span>
    );
  }

  const priceChange = cryptoData.price_change_percentage_1h_in_currency;
  const isPositive = priceChange >= 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="inline-flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 rounded-lg h-auto w-full justify-between group"
      asChild
    >
      <a
        href={`https://www.binance.com/en/trade/${cryptoData.symbol}_USDT`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold">${cryptoData.symbol}</span>
          <span className={`${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(priceChange).toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">${cryptoData.current_price.toLocaleString()}</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </a>
    </Button>
  );
}