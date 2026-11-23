import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Star,
  StarOff,
} from "lucide-react";
import type { CryptoPrice } from "@shared/schema";

interface MarketWatchProps {
  prices: CryptoPrice[];
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
  isLoading?: boolean;
}

export function MarketWatch({
  prices,
  favorites,
  onToggleFavorite,
  onSelectSymbol,
  selectedSymbol,
  isLoading = false,
}: MarketWatchProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000_000) {
      return `$${(volume / 1_000_000_000).toFixed(2)}B`;
    }
    if (volume >= 1_000_000) {
      return `$${(volume / 1_000_000).toFixed(2)}M`;
    }
    return `$${volume.toLocaleString()}`;
  };

  const sortedPrices = [...prices].sort((a, b) => {
    const aFav = favorites.includes(a.symbol) ? -1 : 0;
    const bFav = favorites.includes(b.symbol) ? -1 : 0;
    return aFav - bFav;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="market-watch">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Market Watch
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border">
            {sortedPrices.map((crypto) => (
              <button
                key={crypto.symbol}
                type="button"
                onClick={() => onSelectSymbol(crypto.symbol)}
                className={`w-full p-4 text-left hover-elevate active-elevate-2 transition-colors ${
                  selectedSymbol === crypto.symbol ? "bg-accent/50" : ""
                }`}
                data-testid={`market-item-${crypto.symbol}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(crypto.symbol);
                      }}
                      data-testid={`button-favorite-${crypto.symbol}`}
                    >
                      {favorites.includes(crypto.symbol) ? (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{crypto.symbol}</span>
                        {favorites.includes(crypto.symbol) && (
                          <Badge variant="secondary" className="text-xs">
                            Watching
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {crypto.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-medium">
                      {formatPrice(crypto.price)}
                    </div>
                    <div
                      className={`flex items-center justify-end gap-1 text-sm ${
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
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Vol: {formatVolume(crypto.volume24h)}</span>
                  <span>
                    H: {formatPrice(crypto.high24h)} / L: {formatPrice(crypto.low24h)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
