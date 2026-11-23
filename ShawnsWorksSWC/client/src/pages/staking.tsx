import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, TrendingUp, Calendar, Lock, Loader2 } from "lucide-react";
import { SiEthereum, SiBinance, SiPolygon } from "react-icons/si";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Staking() {
  const [selectedNetwork, setSelectedNetwork] = useState("eth");
  const [amount, setAmount] = useState("10");
  const [duration, setDuration] = useState([6]);
  const { toast } = useToast();

  const networks = [
    { id: "eth", name: "Ethereum", symbol: "ETH", apy: 4.5, icon: <SiEthereum className="h-4 w-4" /> },
    { id: "bsc", name: "Binance Smart Chain", symbol: "BNB", apy: 8.2, icon: <SiBinance className="h-4 w-4" /> },
    { id: "polygon", name: "Polygon", symbol: "MATIC", apy: 12.5, icon: <SiPolygon className="h-4 w-4" /> },
  ];

  // Fetch staking positions
  const { data: stakingPositions, isLoading } = useQuery({
    queryKey: ["/api/staking/positions"],
  });

  // Create staking position mutation
  const stakeMutation = useMutation({
    mutationFn: async () => {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + duration[0]);
      
      return await apiRequest("POST", "/api/staking/positions", {
        networkId: selectedNetwork,
        amount,
        apy: currentNetwork?.apy.toString() || "0",
        endDate: endDate.toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Staking position created",
        description: `Successfully staked ${amount} ${currentNetwork?.symbol} for ${duration[0]} months`,
      });
      setAmount("10");
      queryClient.invalidateQueries({ queryKey: ["/api/staking/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Staking failed",
        description: error.message || "Failed to create staking position",
        variant: "destructive",
      });
    },
  });

  const getNetworkIcon = (networkId: string) => {
    switch (networkId) {
      case "eth": return <SiEthereum className="h-5 w-5" />;
      case "bsc": return <SiBinance className="h-5 w-5" />;
      case "polygon": return <SiPolygon className="h-5 w-5" />;
      default: return null;
    }
  };

  const getNetworkSymbol = (networkId: string) => {
    const network = networks.find(n => n.id === networkId);
    return network?.symbol || networkId.toUpperCase();
  };

  const currentNetwork = networks.find(n => n.id === selectedNetwork);
  const amountNum = parseFloat(amount) || 0;
  const projectedRewards = (amountNum * (currentNetwork?.apy || 0) / 100 / 12 * duration[0]).toFixed(4);
  const totalReturn = (amountNum + parseFloat(projectedRewards)).toFixed(4);

  const handleStake = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to stake",
        variant: "destructive",
      });
      return;
    }
    stakeMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-2" data-testid="text-staking-title">
          Staking Rewards
        </h1>
        <p className="text-muted-foreground">
          Earn passive income by staking your crypto assets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staking Calculator */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staking Calculator</CardTitle>
              <CardDescription>
                Calculate your potential earnings and start staking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Network Selection */}
              <div className="space-y-2">
                <Label htmlFor="network">Select Network</Label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger id="network" data-testid="select-staking-network">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.id} value={network.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-2">
                            {network.icon}
                            <span>{network.name}</span>
                          </div>
                          <Badge variant="secondary">{network.apy}% APY</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="stake-amount">Amount to Stake</Label>
                <div className="relative">
                  <Input
                    id="stake-amount"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pr-20"
                    data-testid="input-stake-amount"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Badge variant="secondary">{currentNetwork?.symbol}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Available: 12.5 {currentNetwork?.symbol}
                </p>
              </div>

              {/* Duration Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Staking Duration</Label>
                  <Badge variant="outline">{duration[0]} months</Badge>
                </div>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  min={1}
                  max={12}
                  step={1}
                  data-testid="slider-duration"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 month</span>
                  <span>12 months</span>
                </div>
              </div>

              {/* Results */}
              <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Projected Rewards</p>
                    <p className="text-2xl font-bold text-status-online" data-testid="text-projected-rewards">
                      +{projectedRewards} {currentNetwork?.symbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Return</p>
                    <p className="text-2xl font-bold" data-testid="text-total-return">
                      {totalReturn} {currentNetwork?.symbol}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-primary/20">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">APY</span>
                    <span className="font-medium">{currentNetwork?.apy}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Lock Period</span>
                    <span className="font-medium">{duration[0]} months</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t border-primary/20">
                    <span>Est. Monthly</span>
                    <span className="text-primary">
                      {(parseFloat(projectedRewards) / duration[0]).toFixed(4)} {currentNetwork?.symbol}
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleStake}
                disabled={!amount || parseFloat(amount) <= 0 || stakeMutation.isPending}
                data-testid="button-start-staking"
              >
                {stakeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Staking...
                  </>
                ) : (
                  "Start Staking"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active Positions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Positions</CardTitle>
              <CardDescription>Your current staking positions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : stakingPositions && stakingPositions.length > 0 ? (
                stakingPositions.map((position: any) => {
                  const daysRemaining = position.endDate 
                    ? Math.floor((new Date(position.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : 0;
                  const progressPercentage = position.endDate 
                    ? Math.max(0, Math.min(100, ((Date.now() - new Date(position.startDate).getTime()) / (new Date(position.endDate).getTime() - new Date(position.startDate).getTime())) * 100))
                    : 0;
                    
                  return (
                    <Card key={position.id} className="border-border" data-testid={`card-position-${position.id}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              {getNetworkIcon(position.networkId)}
                            </div>
                            <div>
                              <p className="font-medium">{networks.find(n => n.id === position.networkId)?.name || position.networkId}</p>
                              <p className="text-xs text-muted-foreground">{position.amount} {getNetworkSymbol(position.networkId)}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{position.apy}% APY</Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Rewards Earned</span>
                            <span className="font-medium text-status-online">
                              +{position.rewardsEarned || "0"} {getNetworkSymbol(position.networkId)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Time Remaining</span>
                              <span>{daysRemaining} days</span>
                            </div>
                            <Progress value={progressPercentage} />
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="w-full" data-testid={`button-claim-${position.id}`}>
                          <Gift className="mr-2 h-3 w-3" />
                          Claim Rewards
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No active positions</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Staking Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm">Total Staked</span>
                </div>
                <span className="font-semibold" data-testid="text-total-staked">$12,543</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="text-sm">Total Rewards</span>
                </div>
                <span className="font-semibold text-status-online" data-testid="text-total-rewards-earned">+$245.32</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">Avg. APY</span>
                </div>
                <span className="font-semibold" data-testid="text-avg-apy">8.5%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
