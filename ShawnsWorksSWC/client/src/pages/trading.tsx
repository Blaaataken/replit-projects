import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Brain, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Trading() {
  const [autotrade, setAutotrade] = useState(false);
  
  const { data: signals, isLoading } = useQuery<any[]>({
    queryKey: ["/api/trading/signals"]
  });

  const mockSignals = signals || [
    { 
      id: "1", 
      symbol: "ETH/USDT", 
      action: "BUY", 
      confidence: 87.5, 
      targetPrice: "2450.00",
      reasoning: "Strong bullish momentum with high volume. RSI indicating oversold conditions. Historical support at $2400 level.",
      createdAt: new Date(Date.now() - 300000).toISOString()
    },
    { 
      id: "2", 
      symbol: "BTC/USDT", 
      action: "HOLD", 
      confidence: 72.3, 
      targetPrice: "42500.00",
      reasoning: "Consolidation phase detected. Wait for breakout above $43k resistance or entry below $41k support.",
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    { 
      id: "3", 
      symbol: "MATIC/USDT", 
      action: "SELL", 
      confidence: 65.8, 
      targetPrice: "0.82",
      reasoning: "Overbought RSI with decreasing volume. Potential correction to $0.80 support level.",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
  ];

  const { data: performance } = useQuery<any>({
    queryKey: ["/api/trading/performance"]
  });

  const mockPerformance = performance || {
    totalTrades: 247,
    successRate: 68.4,
    totalProfit: 5847.23,
    profitChange: 24.5,
    avgTradeTime: "2.4h"
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case "BUY": return "text-status-online";
      case "SELL": return "text-status-busy";
      case "HOLD": return "text-status-away";
      default: return "text-muted-foreground";
    }
  };

  const getActionBadgeVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (action.toUpperCase()) {
      case "BUY": return "default";
      case "SELL": return "destructive";
      case "HOLD": return "secondary";
      default: return "outline";
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-2" data-testid="text-trading-title">
              AI Trading
            </h1>
            <p className="text-muted-foreground">
              Automated trading powered by advanced machine learning
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="autotrade" className="text-sm">Auto-Trade</Label>
            <Switch 
              id="autotrade" 
              checked={autotrade} 
              onCheckedChange={setAutotrade}
              data-testid="switch-autotrade"
            />
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card data-testid="card-stat-trades">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-trades">
              {mockPerformance.totalTrades}
            </div>
            <p className="text-xs text-muted-foreground">
              AI-executed this month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-success-rate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-success-rate">
              {mockPerformance.successRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Profitable trades
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-profit">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-online" data-testid="text-total-profit">
              +${mockPerformance.totalProfit.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="text-status-online">+{mockPerformance.profitChange}%</span>
              <span>vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-trade-time">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trade Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-trade-time">
              {mockPerformance.avgTradeTime}
            </div>
            <p className="text-xs text-muted-foreground">
              Position duration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trading Signals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">AI Trading Signals</h2>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-status-online animate-pulse" />
            <span>Live</span>
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {mockSignals.map((signal) => (
              <Card key={signal.id} className="hover-elevate transition-all" data-testid={`card-signal-${signal.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl" data-testid={`text-signal-symbol-${signal.id}`}>
                          {signal.symbol}
                        </CardTitle>
                        <Badge variant={getActionBadgeVariant(signal.action)} data-testid={`badge-signal-action-${signal.id}`}>
                          {signal.action}
                        </Badge>
                        <Badge variant="outline">
                          {signal.confidence}% confidence
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground">
                        {getTimeAgo(signal.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Target Price</p>
                      <p className="text-lg font-bold" data-testid={`text-signal-price-${signal.id}`}>
                        ${signal.targetPrice}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground" data-testid={`text-signal-reasoning-${signal.id}`}>
                      {signal.reasoning}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" data-testid={`button-execute-${signal.id}`}>
                      Execute Trade
                    </Button>
                    <Button variant="outline" data-testid={`button-details-${signal.id}`}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">AI Trading Disclaimer</h3>
                <p className="text-sm text-muted-foreground">
                  These signals are generated by our AI and should not be considered financial advice. 
                  Always do your own research and only invest what you can afford to lose. Past performance 
                  does not guarantee future results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
