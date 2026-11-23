import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowDownUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TradingPanelProps {
  symbol: string;
  currentPrice: number;
  availableBalance: number;
  holdings: number;
  onTrade: (type: "buy" | "sell", amount: number, price: number) => Promise<void>;
  isLoading?: boolean;
  isPending?: boolean;
}

export function TradingPanel({
  symbol,
  currentPrice,
  availableBalance,
  holdings,
  onTrade,
  isLoading = false,
  isPending = false,
}: TradingPanelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [percentageAmount, setPercentageAmount] = useState(0);

  const maxBuyAmount = currentPrice > 0 ? availableBalance / currentPrice : 0;
  const maxSellAmount = holdings;

  const calculateTotal = () => {
    const qty = parseFloat(amount) || 0;
    return qty * currentPrice;
  };

  const handlePercentageClick = (percentage: number) => {
    setPercentageAmount(percentage);
    const max = activeTab === "buy" ? maxBuyAmount : maxSellAmount;
    const calculatedAmount = (max * percentage) / 100;
    setAmount(calculatedAmount.toFixed(6));
  };

  const handleSliderChange = (value: number[]) => {
    const percentage = value[0];
    setPercentageAmount(percentage);
    const max = activeTab === "buy" ? maxBuyAmount : maxSellAmount;
    const calculatedAmount = (max * percentage) / 100;
    setAmount(calculatedAmount.toFixed(6));
  };

  const handleSubmit = async () => {
    const qty = parseFloat(amount);
    if (isNaN(qty) || qty <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to trade.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "buy" && qty > maxBuyAmount) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance for this trade.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "sell" && qty > maxSellAmount) {
      toast({
        title: "Insufficient holdings",
        description: "You don't have enough of this asset to sell.",
        variant: "destructive",
      });
      return;
    }

    try {
      await onTrade(activeTab, qty, currentPrice);
      setAmount("");
      setPercentageAmount(0);
      toast({
        title: "Trade executed",
        description: `Successfully ${activeTab === "buy" ? "bought" : "sold"} ${qty.toFixed(6)} ${symbol.split("/")[0]}`,
      });
    } catch {
      toast({
        title: "Trade failed",
        description: "There was an error executing your trade. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="trading-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ArrowDownUp className="h-5 w-5" />
          Trade {symbol}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "buy" | "sell")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger
              value="buy"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              data-testid="tab-buy"
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
              data-testid="tab-sell"
            >
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span className="font-mono">{formatCurrency(availableBalance)}</span>
            </div>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Holdings</span>
              <span className="font-mono">
                {holdings.toFixed(6)} {symbol.split("/")[0]}
              </span>
            </div>
          </TabsContent>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="font-mono">{formatCurrency(currentPrice)}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono"
                data-testid="input-trade-amount"
              />
            </div>

            <div className="space-y-3">
              <Slider
                value={[percentageAmount]}
                onValueChange={handleSliderChange}
                max={100}
                step={1}
                className="w-full"
                data-testid="slider-trade-percentage"
              />
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((pct) => (
                  <Button
                    key={pct}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handlePercentageClick(pct)}
                    data-testid={`button-percentage-${pct}`}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-sm py-2 border-t">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-medium">
                {formatCurrency(calculateTotal())}
              </span>
            </div>

            <Button
              className={`w-full h-12 text-lg font-semibold ${
                activeTab === "buy"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              onClick={handleSubmit}
              disabled={isPending || !amount || parseFloat(amount) <= 0}
              data-testid={`button-${activeTab}`}
            >
              {isPending ? (
                "Processing..."
              ) : (
                `${activeTab === "buy" ? "Buy" : "Sell"} ${symbol.split("/")[0]}`
              )}
            </Button>

            {activeTab === "buy" && parseFloat(amount) > maxBuyAmount && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>Insufficient balance</span>
              </div>
            )}

            {activeTab === "sell" && parseFloat(amount) > maxSellAmount && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>Insufficient holdings</span>
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
