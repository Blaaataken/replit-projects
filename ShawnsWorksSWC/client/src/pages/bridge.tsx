import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Zap, Clock, AlertCircle, Loader2 } from "lucide-react";
import { SiEthereum, SiBinance, SiPolygon } from "react-icons/si";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Bridge() {
  const [fromNetwork, setFromNetwork] = useState("eth");
  const [toNetwork, setToNetwork] = useState("bsc");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const networks = [
    { id: "eth", name: "Ethereum", symbol: "ETH", icon: <SiEthereum className="h-4 w-4" /> },
    { id: "bsc", name: "Binance Smart Chain", symbol: "BSC", icon: <SiBinance className="h-4 w-4" /> },
    { id: "polygon", name: "Polygon", symbol: "MATIC", icon: <SiPolygon className="h-4 w-4" /> },
  ];

  // Fetch gas optimization
  const { data: gasOptimization } = useQuery({
    queryKey: ["/api/gas/optimize", fromNetwork, toNetwork, amount],
    enabled: !!amount && parseFloat(amount) > 0,
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/gas/optimize", {
        fromNetwork,
        toNetwork,
        amount: parseFloat(amount),
      });
      return res;
    },
  });

  // Bridge transaction mutation
  const bridgeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/transactions", {
        type: "bridge",
        fromNetwork,
        toNetwork,
        amount,
        status: "pending",
      });
    },
    onSuccess: () => {
      toast({
        title: "Bridge transaction initiated",
        description: `Transferring ${amount} ${getNetworkById(fromNetwork)?.symbol} to ${getNetworkById(toNetwork)?.name}`,
      });
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
    },
    onError: (error: any) => {
      toast({
        title: "Transaction failed",
        description: error.message || "Failed to initiate bridge transaction",
        variant: "destructive",
      });
    },
  });

  const swapNetworks = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  };

  const getNetworkById = (id: string) => networks.find(n => n.id === id);

  const handleBridge = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to bridge",
        variant: "destructive",
      });
      return;
    }
    bridgeMutation.mutate();
  };

  const routes = gasOptimization?.alternatives || [
    { route: "Polygon", fee: 0.45, time: "2-3 min" },
    { route: "Arbitrum", fee: 2.30, time: "3-5 min" },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold mb-2" data-testid="text-bridge-title">
          Cross-Chain Bridge
        </h1>
        <p className="text-muted-foreground">
          Transfer assets seamlessly across multiple blockchain networks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bridge Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Network */}
              <div className="space-y-2">
                <Label htmlFor="from-network">From Network</Label>
                <Select value={fromNetwork} onValueChange={setFromNetwork}>
                  <SelectTrigger id="from-network" data-testid="select-from-network">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.filter(n => n.id !== toNetwork).map((network) => (
                      <SelectItem key={network.id} value={network.id}>
                        <div className="flex items-center gap-2">
                          {network.icon}
                          <span>{network.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pr-20"
                    data-testid="input-bridge-amount"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Badge variant="secondary">{getNetworkById(fromNetwork)?.symbol}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Balance: 12.5 {getNetworkById(fromNetwork)?.symbol}
                </p>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapNetworks}
                  data-testid="button-swap-networks"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              {/* To Network */}
              <div className="space-y-2">
                <Label htmlFor="to-network">To Network</Label>
                <Select value={toNetwork} onValueChange={setToNetwork}>
                  <SelectTrigger id="to-network" data-testid="select-to-network">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.filter(n => n.id !== fromNetwork).map((network) => (
                      <SelectItem key={network.id} value={network.id}>
                        <div className="flex items-center gap-2">
                          {network.icon}
                          <span>{network.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* You Will Receive */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">You will receive</p>
                <p className="text-2xl font-bold" data-testid="text-receive-amount">
                  {amount || "0.0"} {getNetworkById(toNetwork)?.symbol}
                </p>
              </div>

              {/* Bridge Button */}
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleBridge}
                disabled={!amount || parseFloat(amount) <= 0 || bridgeMutation.isPending}
                data-testid="button-bridge-tokens"
              >
                {bridgeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Bridging...
                  </>
                ) : (
                  "Bridge Tokens"
                )}
              </Button>

              {/* Info */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Important</p>
                      <p>
                        Cross-chain bridges may take several minutes to complete. 
                        Make sure you have enough {getNetworkById(fromNetwork)?.symbol} for gas fees on the source network.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Route Optimization */}
        <div className="space-y-6">
          {/* AI Optimization */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>AI Route Optimization</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {gasOptimization && (
                <div className="p-3 rounded-lg border border-primary bg-primary/5 mb-4" data-testid="card-route-recommended">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{gasOptimization.recommendedRoute}</span>
                      <Badge variant="default" className="text-xs">
                        AI Recommended
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      <span>${gasOptimization.estimatedFee}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{gasOptimization.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {routes.map((route, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-border bg-card"
                    data-testid={`card-route-${index}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{route.route}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>${route.fee}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{route.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Estimated Gas</span>
                  <span className="font-medium">${gasOptimization?.estimatedFee || "0.45"}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Bridge Fee</span>
                  <span className="font-medium">0.1%</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold pt-2 border-t">
                  <span>Total Fee</span>
                  <span className="text-primary">${gasOptimization?.estimatedFee ? (parseFloat(gasOptimization.estimatedFee.toString()) + 0.1).toFixed(2) : "0.55"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supported Networks */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Networks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {networks.map((network) => (
                  <div
                    key={network.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`network-support-${network.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {network.icon}
                      </div>
                      <span className="font-medium">{network.name}</span>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-status-online" />
                      <span>Active</span>
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
