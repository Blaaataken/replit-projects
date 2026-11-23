import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link2, Unlink, Wallet, AlertTriangle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExchangeBalance {
  currency: string;
  free: number;
  used: number;
  total: number;
}

interface ExchangeStatus {
  connected: boolean;
  exchange: string | null;
}

export function ExchangeConnect() {
  const { toast } = useToast();
  const [exchange, setExchange] = useState<string>("coinbase");
  const [apiKey, setApiKey] = useState("");
  const [secret, setSecret] = useState("");
  const [password, setPassword] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: status, isLoading: statusLoading } = useQuery<ExchangeStatus>({
    queryKey: ["/api/exchange/status"],
  });

  const { data: balances } = useQuery<ExchangeBalance[]>({
    queryKey: ["/api/exchange/balances"],
    enabled: status?.connected === true,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/exchange/connect", {
        exchange,
        apiKey,
        secret,
        password: password || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchange/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exchange/balances"] });
      setApiKey("");
      setSecret("");
      setPassword("");
      toast({
        title: "Exchange Connected",
        description: `Successfully connected to ${exchange}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to exchange",
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/exchange/disconnect");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchange/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exchange/balances"] });
      toast({
        title: "Disconnected",
        description: "Exchange disconnected successfully",
      });
    },
  });

  const handleConnect = () => {
    if (!apiKey || !secret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your API key and secret",
        variant: "destructive",
      });
      return;
    }
    connectMutation.mutate();
  };

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <span className="text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status?.connected) {
    return (
      <Card data-testid="exchange-connected">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Live Trading
              </CardTitle>
              <CardDescription className="mt-1">
                Connected to {status.exchange}
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-emerald-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {balances && balances.length > 0 && (
            <div className="space-y-2">
              <Label>Account Balances</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {balances.slice(0, 6).map((bal) => (
                  <div
                    key={bal.currency}
                    className="p-3 rounded-lg bg-muted/50"
                    data-testid={`balance-${bal.currency}`}
                  >
                    <div className="text-xs text-muted-foreground">
                      {bal.currency}
                    </div>
                    <div className="font-mono font-medium">
                      {bal.total.toFixed(bal.currency === "USD" || bal.currency === "USDT" ? 2 : 6)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Live trading is enabled. All trades will use real funds from your {status.exchange} account.
            </AlertDescription>
          </Alert>

          <Button
            variant="destructive"
            className="w-full"
            onClick={() => disconnectMutation.mutate()}
            disabled={disconnectMutation.isPending}
            data-testid="button-disconnect"
          >
            <Unlink className="h-4 w-4 mr-2" />
            {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect Exchange"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="exchange-connect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Connect Exchange
        </CardTitle>
        <CardDescription>
          Connect your exchange account for live trading
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> Connecting your exchange will enable real trading with real funds. 
            Only use API keys with trading permissions you're comfortable with. 
            Start with small amounts to test.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label>Exchange</Label>
          <Select value={exchange} onValueChange={setExchange}>
            <SelectTrigger data-testid="select-exchange">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coinbase">Coinbase</SelectItem>
              <SelectItem value="kraken">Kraken</SelectItem>
              <SelectItem value="binance">Binance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>API Key</Label>
          <Input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            data-testid="input-api-key"
          />
        </div>

        <div className="space-y-2">
          <Label>API Secret</Label>
          <div className="relative">
            <Input
              type={showSecret ? "text" : "password"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your API secret"
              data-testid="input-api-secret"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {(exchange === "coinbase") && (
          <div className="space-y-2">
            <Label>API Passphrase (Coinbase only)</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your API passphrase"
                data-testid="input-api-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleConnect}
          disabled={connectMutation.isPending || !apiKey || !secret}
          data-testid="button-connect"
        >
          <Link2 className="h-4 w-4 mr-2" />
          {connectMutation.isPending ? "Connecting..." : "Connect Exchange"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your API credentials are sent directly to your exchange and are not stored.
        </p>
      </CardContent>
    </Card>
  );
}
