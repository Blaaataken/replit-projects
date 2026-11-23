import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { History, Bot, User, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Trade } from "@shared/schema";

interface TradeHistoryProps {
  trades: Trade[];
  isLoading?: boolean;
}

export function TradeHistory({ trades, isLoading = false }: TradeHistoryProps) {
  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trades.length === 0) {
    return (
      <Card data-testid="trade-history">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Trade History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <History className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No trades yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your trading history will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="trade-history">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Trade History
          <Badge variant="secondary" className="ml-2">
            {trades.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id} data-testid={`trade-row-${trade.id}`}>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(trade.executedAt)}
                  </TableCell>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    <div
                      className={`flex items-center gap-1 ${
                        trade.type === "buy" ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {trade.type === "buy" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      <span className="capitalize font-medium">{trade.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(trade.price)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {parseFloat(trade.quantity).toFixed(6)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatCurrency(trade.total)}
                  </TableCell>
                  <TableCell>
                    {trade.isBot ? (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Bot className="h-3 w-3" />
                        <span className="text-xs">Bot</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="text-xs">Manual</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        trade.status === "completed"
                          ? "default"
                          : trade.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {trade.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
