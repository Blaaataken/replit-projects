import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Wallet, Network, Gift, Zap, Send, Download, ArrowLeftRight } from "lucide-react";
import { SiEthereum, SiBinance, SiPolygon } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: portfolios, isLoading } = useQuery<any[]>({ 
    queryKey: ["/api/portfolios"]
  });

  const { data: stats } = useQuery<any>({ 
    queryKey: ["/api/stats"]
  });

  const mockStats = stats || {
    totalBalance: 45723.45,
    balanceChange: 12.5,
    activeNetworks: 3,
    rewardsEarned: 1247.89,
    rewardsChange: 8.3,
    gasSaved: 342.15,
    gasSavedChange: 15.2
  };

  const mockPortfolios = portfolios || [
    { id: "1", networkId: "eth", tokenSymbol: "ETH", balance: "12.5", usdValue: "23456.78", network: { name: "Ethereum", symbol: "ETH" } },
    { id: "2", networkId: "bsc", tokenSymbol: "BNB", balance: "45.2", usdValue: "15234.56", network: { name: "Binance Smart Chain", symbol: "BSC" } },
    { id: "3", networkId: "polygon", tokenSymbol: "MATIC", balance: "1234.5", usdValue: "7032.11", network: { name: "Polygon", symbol: "MATIC" } },
  ];

  const getNetworkIcon = (networkId: string) => {
    switch (networkId) {
      case "eth": return <SiEthereum className="h-5 w-5" />;
      case "bsc": return <SiBinance className="h-5 w-5" />;
      case "polygon": return <SiPolygon className="h-5 w-5" />;
      default: return <Network className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-2" data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your multi-chain portfolio and track performance
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card data-testid="card-stat-balance">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-balance">
                  ${mockStats.totalBalance.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {mockStats.balanceChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-status-online" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-status-busy" />
                  )}
                  <span className={mockStats.balanceChange >= 0 ? "text-status-online" : "text-status-busy"}>
                    {mockStats.balanceChange >= 0 ? "+" : ""}{mockStats.balanceChange}%
                  </span>
                  <span>vs last week</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-stat-networks">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Networks</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-networks">
              {mockStats.activeNetworks}
            </div>
            <p className="text-xs text-muted-foreground">
              Connected blockchains
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-rewards">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Earned</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-rewards-earned">
              ${mockStats.rewardsEarned.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-status-online" />
              <span className="text-status-online">+{mockStats.rewardsChange}%</span>
              <span>this month</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-gas-saved">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas Saved</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-gas-saved">
              ${mockStats.gasSaved.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-status-online" />
              <span className="text-status-online">+{mockStats.gasSavedChange}%</span>
              <span>via AI routing</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Balances */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Network Balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPortfolios.map((portfolio) => (
            <Card key={portfolio.id} className="hover-elevate transition-all" data-testid={`card-network-${portfolio.networkId}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {getNetworkIcon(portfolio.networkId)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{portfolio.network.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        <div className="h-2 w-2 rounded-full bg-status-online mr-1" />
                        Connected
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Balance</p>
                  <p className="text-3xl font-bold" data-testid={`text-balance-${portfolio.networkId}`}>
                    {portfolio.balance} {portfolio.tokenSymbol}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1" data-testid={`text-usd-${portfolio.networkId}`}>
                    ≈ ${parseFloat(portfolio.usdValue).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" data-testid={`button-send-${portfolio.networkId}`}>
                    <Send className="h-3 w-3 mr-1" />
                    Send
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" data-testid={`button-receive-${portfolio.networkId}`}>
                    <Download className="h-3 w-3 mr-1" />
                    Receive
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" data-testid={`button-swap-${portfolio.networkId}`}>
                    <ArrowLeftRight className="h-3 w-3 mr-1" />
                    Swap
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-action-bridge">
            <CardContent className="p-6 text-center">
              <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Cross-Chain Bridge</h3>
              <p className="text-sm text-muted-foreground">Transfer assets between networks</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-action-stake">
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Start Staking</h3>
              <p className="text-sm text-muted-foreground">Earn rewards on your holdings</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-action-trade">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">AI Trading</h3>
              <p className="text-sm text-muted-foreground">Automated trading strategies</p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer transition-all" data-testid="card-action-optimize">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Optimize Gas</h3>
              <p className="text-sm text-muted-foreground">Find cheapest transaction routes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
