import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { X, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import type { Position } from "@shared/schema";

interface PositionsTableProps {
  positions: Position[];
  currentPrices: Record<string, number>;
  onClosePosition: (positionId: string) => void;
  isLoading?: boolean;
}

export function PositionsTable({
  positions,
  currentPrices,
  onClosePosition,
  isLoading = false,
}: PositionsTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return formatCurrency(price);
    }
    return `$${price.toFixed(6)}`;
  };

  const calculatePnL = (position: Position) => {
    const currentPrice = currentPrices[position.symbol] || parseFloat(position.entryPrice);
    const entryPrice = parseFloat(position.entryPrice);
    const quantity = parseFloat(position.quantity);
    const pnlValue = (currentPrice - entryPrice) * quantity;
    const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
    return { value: pnlValue, percent: pnlPercent, currentPrice };
  };

  const openPositions = positions.filter((p) => p.status === "open");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (openPositions.length === 0) {
    return (
      <Card data-testid="positions-table">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No active positions</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start trading to open a position
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="positions-table">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Active Positions
          <Badge variant="secondary" className="ml-2">
            {openPositions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead className="text-right">Stop Loss</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {openPositions.map((position) => {
                const { value: pnlValue, percent: pnlPercent, currentPrice } = calculatePnL(position);
                const targetPrice = parseFloat(position.targetPrice);
                const stopLoss = parseFloat(position.stopLossPrice);
                const isNearTarget = currentPrice >= targetPrice * 0.95;
                const isNearStopLoss = currentPrice <= stopLoss * 1.05;

                return (
                  <TableRow key={position.id} data-testid={`position-row-${position.id}`}>
                    <TableCell className="font-medium">{position.symbol}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPrice(parseFloat(position.entryPrice))}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatPrice(currentPrice)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {parseFloat(position.quantity).toFixed(6)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={`flex items-center justify-end gap-1 font-mono ${
                          pnlValue >= 0 ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {pnlValue >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{formatCurrency(Math.abs(pnlValue))}</span>
                        <span className="text-xs">
                          ({pnlPercent >= 0 ? "+" : ""}
                          {pnlPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-mono text-emerald-500">
                          {formatPrice(targetPrice)}
                        </span>
                        {isNearTarget && (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-mono text-red-500">
                          {formatPrice(stopLoss)}
                        </span>
                        {isNearStopLoss && (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onClosePosition(position.id)}
                        data-testid={`button-close-position-${position.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
