'use client';

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 300
    }
  }),
  hover: { scale: 1.02 }
};

export function TopCryptoList() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
        );
        if (!response.ok) throw new Error('Failed to fetch crypto data');
        const data = await response.json();
        setCryptos(data);
      } catch (err) {
        setError('Failed to load cryptocurrency data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCryptos();
    const interval = setInterval(fetchCryptos, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || error) {
    return (
      <div className="rounded-xl bg-muted/50 p-4">
        <h2 className="mb-4 text-xl font-bold">Top Cryptocurrencies</h2>
        <div className="flex justify-center p-4">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <span className="text-sm text-muted-foreground">{error}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl bg-muted/50 p-4"
    >
      <h2 className="mb-4 text-xl font-bold">Top Cryptocurrencies</h2>
      <div className="space-y-2">
        {cryptos.map((crypto, index) => (
          <motion.div
            key={crypto.id}
            custom={index}
            variants={listItemVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="group flex items-center justify-between rounded-lg p-3 transition-all hover:bg-primary/5 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <img
                src={crypto.image}
                alt={crypto.name}
                className="h-8 w-8 rounded-full transition-transform group-hover:scale-110"
              />
              <div className="flex flex-col">
                <span className="font-semibold transition-colors group-hover:text-primary">
                  {crypto.symbol.toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {crypto.name}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="font-medium transition-colors group-hover:text-primary">
                ${crypto.current_price.toLocaleString()}
              </span>
              <span className={`text-xs flex items-center gap-1 ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                {crypto.price_change_percentage_24h >= 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 