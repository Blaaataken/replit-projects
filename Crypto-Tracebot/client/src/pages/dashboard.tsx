import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import { PriceTicker } from "@/components/price-ticker";
import { PortfolioSummary } from "@/components/portfolio-summary";
import { TradingChart } from "@/components/trading-chart";
import { TradingPanel } from "@/components/trading-panel";
import { PositionsTable } from "@/components/positions-table";
import { TradeHistory } from "@/components/trade-history";
import { BotSettingsComponent } from "@/components/bot-settings";
import { AIInsights } from "@/components/ai-insights";
import { MarketWatch } from "@/components/market-watch";
import { HoldingsList } from "@/components/holdings-list";
import { ExchangeConnect } from "@/components/exchange-connect";
import { SafetyPanel } from "@/components/safety-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type {
  CryptoPrice,
  ChartDataPoint,
  Trade,
  Position,
  PortfolioHolding,
  BotSettings,
  AIInsight,
} from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USDT");
  const [favorites, setFavorites] = useState<string[]>(["BTC/USDT", "ETH/USDT"]);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Connect to WebSocket for real-time updates
  useWebSocket();

  // Fetch market prices (WebSocket will update this query data)
  const { data: prices = [], isLoading: pricesLoading } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/market/prices"],
    staleTime: Infinity,
  });

  // Fetch chart data
  const { data: chartData = [], isLoading: chartLoading } = useQuery<ChartDataPoint[]>({
    queryKey: ["/api/market/chart", selectedSymbol],
  });

  // Fetch portfolio summary
  const { data: portfolio, isLoading: portfolioLoading } = useQuery<{
    totalBalance: number;
    totalPnL: number;
    pnlPercentage: number;
    availableFunds: number;
    activePositions: number;
    winRate: number;
  }>({
    queryKey: ["/api/portfolio/summary"],
  });

  // Fetch holdings
  const { data: holdings = [], isLoading: holdingsLoading } = useQuery<PortfolioHolding[]>({
    queryKey: ["/api/portfolio/holdings"],
  });

  // Fetch positions
  const { data: positions = [], isLoading: positionsLoading } = useQuery<Position[]>({
    queryKey: ["/api/positions"],
  });

  // Fetch trades
  const { data: trades = [], isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });

  // Fetch bot settings
  const { data: botSettings, isLoading: botSettingsLoading } = useQuery<BotSettings | null>({
    queryKey: ["/api/bot/settings"],
  });

  // Fetch AI insights
  const { data: insights = [], isLoading: insightsLoading } = useQuery<AIInsight[]>({
    queryKey: ["/api/ai/insights"],
  });

  // Trade mutation
  const tradeMutation = useMutation({
    mutationFn: async ({ type, amount, price, symbol }: { type: "buy" | "sell"; amount: number; price: number; symbol: string }) => {
      return apiRequest("POST", "/api/trades", { type, amount, price, symbol });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/holdings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
    },
  });

  // Close position mutation
  const closePositionMutation = useMutation({
    mutationFn: async (positionId: string) => {
      return apiRequest("POST", `/api/positions/${positionId}/close`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/summary"] });
      toast({ title: "Position closed", description: "Your position has been closed successfully." });
    },
  });

  // Save bot settings mutation
  const saveBotSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<BotSettings>) => {
      return apiRequest("PUT", "/api/bot/settings", settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/settings"] });
      toast({ title: "Settings saved", description: "Your bot settings have been updated." });
    },
  });

  // Toggle bot active mutation
  const toggleBotMutation = useMutation({
    mutationFn: async (active: boolean) => {
      return apiRequest("POST", "/api/bot/toggle", { active });
    },
    onSuccess: (_, active) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/settings"] });
      toast({
        title: active ? "Bot activated" : "Bot deactivated",
        description: active
          ? "Trading bot is now running with your configured strategy."
          : "Trading bot has been stopped.",
      });
    },
  });

  // Refresh insights mutation
  const refreshInsightsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/ai/insights/refresh", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/insights"] });
    },
  });

  const currentPrice = prices.find((p) => p.symbol === selectedSymbol)?.price || 0;
  const priceChange = prices.find((p) => p.symbol === selectedSymbol)?.change24h || 0;
  const currentHolding = holdings.find(
    (h) => h.symbol === selectedSymbol.split("/")[0]
  );
  const holdingQuantity = currentHolding ? parseFloat(currentHolding.quantity) : 0;

  const pricesMap = prices.reduce((acc, p) => {
    acc[p.symbol] = p.price;
    acc[p.symbol.split("/")[0]] = p.price;
    return acc;
  }, {} as Record<string, number>);

  const handleTrade = async (type: "buy" | "sell", amount: number, price: number) => {
    await tradeMutation.mutateAsync({ type, amount, price, symbol: selectedSymbol });
  };

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-page">
      <PriceTicker prices={prices} />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <PortfolioSummary
          totalBalance={portfolio?.totalBalance || 0}
          totalPnL={portfolio?.totalPnL || 0}
          pnlPercentage={portfolio?.pnlPercentage || 0}
          availableFunds={portfolio?.availableFunds || 0}
          activePositions={portfolio?.activePositions || 0}
          winRate={portfolio?.winRate || 0}
          isLoading={portfolioLoading}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="trading" data-testid="tab-trading">
              Trading
            </TabsTrigger>
            <TabsTrigger value="portfolio" data-testid="tab-portfolio">
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="bot" data-testid="tab-bot">
              Bot Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TradingChart
                  data={chartData}
                  symbol={selectedSymbol}
                  currentPrice={currentPrice}
                  priceChange={priceChange}
                  onSymbolChange={setSelectedSymbol}
                  availableSymbols={prices.map((p) => p.symbol)}
                  isLoading={chartLoading || pricesLoading}
                />
                <PositionsTable
                  positions={positions}
                  currentPrices={pricesMap}
                  onClosePosition={(id) => closePositionMutation.mutate(id)}
                  isLoading={positionsLoading}
                />
              </div>
              <div className="space-y-6">
                <TradingPanel
                  symbol={selectedSymbol}
                  currentPrice={currentPrice}
                  availableBalance={portfolio?.availableFunds || 0}
                  holdings={holdingQuantity}
                  onTrade={handleTrade}
                  isLoading={portfolioLoading}
                  isPending={tradeMutation.isPending}
                />
                <AIInsights
                  insights={insights}
                  onRefresh={() => refreshInsightsMutation.mutate()}
                  isLoading={insightsLoading}
                  isRefreshing={refreshInsightsMutation.isPending}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <TradingChart
                  data={chartData}
                  symbol={selectedSymbol}
                  currentPrice={currentPrice}
                  priceChange={priceChange}
                  onSymbolChange={setSelectedSymbol}
                  availableSymbols={prices.map((p) => p.symbol)}
                  isLoading={chartLoading || pricesLoading}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TradingPanel
                    symbol={selectedSymbol}
                    currentPrice={currentPrice}
                    availableBalance={portfolio?.availableFunds || 0}
                    holdings={holdingQuantity}
                    onTrade={handleTrade}
                    isLoading={portfolioLoading}
                    isPending={tradeMutation.isPending}
                  />
                  <AIInsights
                    insights={insights.filter((i) => i.symbol === selectedSymbol)}
                    onRefresh={() => refreshInsightsMutation.mutate()}
                    isLoading={insightsLoading}
                    isRefreshing={refreshInsightsMutation.isPending}
                  />
                </div>
              </div>
              <div>
                <MarketWatch
                  prices={prices}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onSelectSymbol={setSelectedSymbol}
                  selectedSymbol={selectedSymbol}
                  isLoading={pricesLoading}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <PositionsTable
                  positions={positions}
                  currentPrices={pricesMap}
                  onClosePosition={(id) => closePositionMutation.mutate(id)}
                  isLoading={positionsLoading}
                />
                <TradeHistory trades={trades} isLoading={tradesLoading} />
              </div>
              <div>
                <HoldingsList
                  holdings={holdings}
                  currentPrices={pricesMap}
                  isLoading={holdingsLoading}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bot" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <SafetyPanel />
                <ExchangeConnect />
                <BotSettingsComponent
                  settings={botSettings || null}
                  onSave={async (settings) => { await saveBotSettingsMutation.mutateAsync(settings); }}
                  onToggle={async (active) => { await toggleBotMutation.mutateAsync(active); }}
                  isLoading={botSettingsLoading}
                  isSaving={saveBotSettingsMutation.isPending}
                />
              </div>
              <div className="space-y-6">
                <AIInsights
                  insights={insights}
                  onRefresh={() => refreshInsightsMutation.mutate()}
                  isLoading={insightsLoading}
                  isRefreshing={refreshInsightsMutation.isPending}
                />
                <TradeHistory
                  trades={trades.filter((t) => t.isBot)}
                  isLoading={tradesLoading}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
