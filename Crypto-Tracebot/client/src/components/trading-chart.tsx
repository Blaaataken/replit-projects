import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartDataPoint } from "@shared/schema";

interface TradingChartProps {
  data: ChartDataPoint[];
  symbol: string;
  currentPrice: number;
  priceChange: number;
  onSymbolChange: (symbol: string) => void;
  availableSymbols: string[];
  isLoading?: boolean;
}

const timeframes = ["1H", "4H", "1D", "1W", "1M"];

export function TradingChart({
  data,
  symbol,
  currentPrice,
  priceChange,
  onSymbolChange,
  availableSymbols,
  isLoading = false,
}: TradingChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState("1D");

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (activeTimeframe === "1H" || activeTimeframe === "4H") {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <Skeleton className="h-9 w-32" />
            <div>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="flex gap-1">
            {timeframes.map((tf) => (
              <Skeleton key={tf} className="h-8 w-12" />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="trading-chart">
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={symbol} onValueChange={onSymbolChange}>
            <SelectTrigger
              className="w-32"
              data-testid="select-trading-pair"
            >
              <SelectValue placeholder="Select pair" />
            </SelectTrigger>
            <SelectContent>
              {availableSymbols.map((sym) => (
                <SelectItem key={sym} value={sym}>
                  {sym}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <div className="text-2xl font-bold font-mono">
              {formatPrice(currentPrice)}
            </div>
            <div
              className={`text-sm font-medium ${
                priceChange >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {priceChange >= 0 ? "+" : ""}
              {priceChange.toFixed(2)}%
            </div>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={activeTimeframe === tf ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTimeframe(tf)}
              data-testid={`button-timeframe-${tf}`}
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={priceChange >= 0 ? "#10b981" : "#ef4444"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={priceChange >= 0 ? "#10b981" : "#ef4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tickFormatter={formatTime}
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val) => formatPrice(val)}
                className="text-xs"
                stroke="hsl(var(--muted-foreground))"
                axisLine={false}
                tickLine={false}
                width={80}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--card-border))",
                  borderRadius: "6px",
                }}
                labelFormatter={formatTime}
                formatter={(value: number) => [formatPrice(value), "Price"]}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={priceChange >= 0 ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
