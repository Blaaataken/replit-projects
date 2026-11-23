import { TrendingUp, TrendingDown } from "lucide-react";
import type { CryptoPrice } from "@shared/schema";

interface PriceTickerProps {
  prices: CryptoPrice[];
}

export function PriceTicker({ prices }: PriceTickerProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div
      className="h-12 bg-card border-b border-card-border overflow-hidden"
      data-testid="price-ticker"
    >
      <div className="h-full flex items-center animate-scroll">
        <div className="flex items-center gap-8 px-4">
          {prices.map((crypto) => (
            <div
              key={crypto.symbol}
              className="flex items-center gap-3 whitespace-nowrap"
              data-testid={`ticker-${crypto.symbol}`}
            >
              <span className="font-medium text-foreground">{crypto.symbol}</span>
              <span className="font-mono text-sm">
                ${formatPrice(crypto.price)}
              </span>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  crypto.change24h >= 0
                    ? "text-emerald-500"
                    : "text-red-500"
                }`}
              >
                {crypto.change24h >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatChange(crypto.change24h)}
              </span>
            </div>
          ))}
          {prices.map((crypto) => (
            <div
              key={`${crypto.symbol}-dup`}
              className="flex items-center gap-3 whitespace-nowrap"
            >
              <span className="font-medium text-foreground">{crypto.symbol}</span>
              <span className="font-mono text-sm">
                ${formatPrice(crypto.price)}
              </span>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  crypto.change24h >= 0
                    ? "text-emerald-500"
                    : "text-red-500"
                }`}
              >
                {crypto.change24h >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatChange(crypto.change24h)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
