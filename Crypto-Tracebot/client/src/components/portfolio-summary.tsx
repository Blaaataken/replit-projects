import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Wallet, DollarSign, Activity, Target, Radio, MonitorPlay } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface ExchangeStatus {
  connected: boolean;
  exchange: string | null;
}

interface PortfolioSummaryProps {
  totalBalance: number;
  totalPnL: number;
  pnlPercentage: number;
  availableFunds: number;
  activePositions: number;
  winRate: number;
  isLoading?: boolean;
}

export function PortfolioSummary({
  totalBalance,
  totalPnL,
  pnlPercentage,
  availableFunds,
  activePositions,
  winRate,
  isLoading = false,
}: PortfolioSummaryProps) {
  const { data: exchangeStatus } = useQuery<ExchangeStatus>({
    queryKey: ["/api/exchange/status"],
  });

  const isLiveMode = exchangeStatus?.connected === true;
  const exchangeName = exchangeStatus?.exchange;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const stats = [
    {
      title: "Total Balance",
      value: formatCurrency(totalBalance),
      icon: Wallet,
      testId: "stat-total-balance",
    },
    {
      title: "24h P&L",
      value: formatCurrency(totalPnL),
      change: pnlPercentage,
      icon: totalPnL >= 0 ? TrendingUp : TrendingDown,
      testId: "stat-pnl",
    },
    {
      title: "Available Funds",
      value: formatCurrency(availableFunds),
      icon: DollarSign,
      testId: "stat-available-funds",
    },
    {
      title: "Active Positions",
      value: activePositions.toString(),
      icon: Activity,
      testId: "stat-active-positions",
    },
    {
      title: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      icon: Target,
      testId: "stat-win-rate",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-semibold">Portfolio Overview</h2>
        <Badge 
          variant={isLiveMode ? "default" : "secondary"}
          className={isLiveMode ? "bg-emerald-500" : ""}
          data-testid="badge-trading-mode"
        >
          {isLiveMode ? (
            <>
              <Radio className="h-3 w-3 mr-1 animate-pulse" />
              Live Trading - {exchangeName}
            </>
          ) : (
            <>
              <MonitorPlay className="h-3 w-3 mr-1" />
              Simulation Mode
            </>
          )}
        </Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon
                className={`h-5 w-5 ${
                  stat.change !== undefined
                    ? stat.change >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                    : "text-muted-foreground"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-bold font-mono">{stat.value}</span>
                {stat.change !== undefined && (
                  <span
                    className={`text-sm font-medium ${
                      stat.change >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {stat.change >= 0 ? "+" : ""}
                    {stat.change.toFixed(2)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
