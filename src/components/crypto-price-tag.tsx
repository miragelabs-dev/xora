'use client';

import { useCrypto } from "@/contexts/crypto-context";
import { ArrowDown, ArrowUp, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface CryptoPriceTagProps {
  symbol: string;
}

export function CryptoPriceTag({ symbol }: CryptoPriceTagProps) {
  const { prices, isLoading, error } = useCrypto();
  const normalizedSymbol = symbol.toUpperCase();
  const cryptoData = prices[normalizedSymbol];

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted/50 rounded-md">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading...
      </span>
    );
  }

  if (error || !cryptoData) {
    return
  }

  const priceChange = cryptoData.price_change_percentage_24h;
  const isPositive = priceChange >= 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="inline-flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 rounded-lg h-auto w-full justify-between group"
      asChild
    >
      <a
        href={`https://www.binance.com/en/trade/${normalizedSymbol}_USDT`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold">${normalizedSymbol}</span>
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