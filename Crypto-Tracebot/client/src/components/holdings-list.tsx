import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import type { PortfolioHolding } from "@shared/schema";

interface HoldingsListProps {
  holdings: PortfolioHolding[];
  currentPrices: Record<string, number>;
  isLoading?: boolean;
}

export function HoldingsList({
  holdings,
  currentPrices,
  isLoading = false,
}: HoldingsListProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const calculatePnL = (holding: PortfolioHolding) => {
    const currentPrice = currentPrices[holding.symbol] || 0;
    const avgPrice = parseFloat(holding.averageBuyPrice);
    const quantity = parseFloat(holding.quantity);
    const currentValue = currentPrice * quantity;
    const costBasis = avgPrice * quantity;
    const pnlValue = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnlValue / costBasis) * 100 : 0;
    return { currentValue, pnlValue, pnlPercent };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (holdings.length === 0) {
    return (
      <Card data-testid="holdings-list">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No holdings yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start trading to build your portfolio
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = holdings.reduce((sum, holding) => {
    const { currentValue } = calculatePnL(holding);
    return sum + currentValue;
  }, 0);

  return (
    <Card data-testid="holdings-list">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Holdings
          </CardTitle>
          <Badge variant="secondary" className="font-mono">
            {formatCurrency(totalValue)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[300px]">
          <div className="divide-y divide-border">
            {holdings.map((holding) => {
              const { currentValue, pnlValue, pnlPercent } = calculatePnL(holding);
              const currentPrice = currentPrices[holding.symbol] || 0;

              return (
                <div
                  key={holding.id}
                  className="p-4"
                  data-testid={`holding-${holding.id}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="font-medium">{holding.symbol}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {holding.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">
                        {formatCurrency(currentValue)}
                      </div>
                      <div
                        className={`flex items-center justify-end gap-1 text-sm ${
                          pnlValue >= 0 ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {pnlValue >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatCurrency(Math.abs(pnlValue))} (
                        {pnlPercent >= 0 ? "+" : ""}
                        {pnlPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Qty: {parseFloat(holding.quantity).toFixed(6)}
                    </span>
                    <span>
                      Avg: {formatCurrency(parseFloat(holding.averageBuyPrice))} / Now:{" "}
                      {formatCurrency(currentPrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
