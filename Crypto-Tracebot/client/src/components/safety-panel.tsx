import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ShieldAlert, ShieldCheck, Power, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SafetyStatus {
  killSwitchActive: boolean;
  dailyLoss: number;
  dailyLossPercent: number;
  maxDailyLossPercent: number;
  maxPositionPercent: number;
}

export function SafetyPanel() {
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);

  const { data: safety, isLoading, refetch } = useQuery<SafetyStatus>({
    queryKey: ["/api/bot/safety"],
    refetchInterval: 5000,
  });

  const killSwitchMutation = useMutation({
    mutationFn: async (activate: boolean) => {
      return apiRequest("POST", "/api/bot/kill-switch", {
        activate,
        reason: activate ? "manual" : undefined,
      });
    },
    onSuccess: (_, activate) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/safety"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bot/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exchange/status"] });
      setIsConfirming(false);
      toast({
        title: activate ? "Kill Switch Activated" : "Kill Switch Deactivated",
        description: activate
          ? "All trading has been halted immediately."
          : "Trading can now resume.",
        variant: activate ? "destructive" : "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle kill switch",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !safety) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Safety Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            Loading safety status...
          </div>
        </CardContent>
      </Card>
    );
  }

  const lossProgressColor = safety.dailyLossPercent > 7
    ? "bg-red-500"
    : safety.dailyLossPercent > 4
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <Card data-testid="safety-panel">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Safety Controls
            </CardTitle>
            <CardDescription className="mt-1">
              Emergency controls and loss limits
            </CardDescription>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => refetch()}
            data-testid="button-refresh-safety"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-medium">Kill Switch Status</span>
            <Badge
              variant={safety.killSwitchActive ? "destructive" : "secondary"}
              className={safety.killSwitchActive ? "" : "bg-emerald-500 text-white"}
            >
              {safety.killSwitchActive ? (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  ACTIVE
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Normal
                </span>
              )}
            </Badge>
          </div>

          {safety.killSwitchActive ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => killSwitchMutation.mutate(false)}
              disabled={killSwitchMutation.isPending}
              data-testid="button-deactivate-kill-switch"
            >
              <Power className="h-4 w-4 mr-2" />
              {killSwitchMutation.isPending ? "Deactivating..." : "Deactivate Kill Switch"}
            </Button>
          ) : isConfirming ? (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => killSwitchMutation.mutate(true)}
                disabled={killSwitchMutation.isPending}
                data-testid="button-confirm-kill-switch"
              >
                {killSwitchMutation.isPending ? "Activating..." : "Confirm - Stop All Trading"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsConfirming(false)}
                data-testid="button-cancel-kill-switch"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setIsConfirming(true)}
              data-testid="button-activate-kill-switch"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergency Stop - Activate Kill Switch
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-medium">Daily Loss Limit</span>
            <span className="text-sm text-muted-foreground">
              {safety.dailyLossPercent.toFixed(1)}% / {safety.maxDailyLossPercent}%
            </span>
          </div>
          <Progress
            value={(safety.dailyLossPercent / safety.maxDailyLossPercent) * 100}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            Daily loss: ${safety.dailyLoss.toFixed(2)}. Trading stops automatically at {safety.maxDailyLossPercent}% loss.
          </p>
        </div>

        <div className="rounded-lg border p-3 bg-muted/50">
          <h4 className="text-sm font-medium mb-2">Safety Limits Active</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>Max position size: {safety.maxPositionPercent}% of portfolio</li>
            <li>Max daily loss: {safety.maxDailyLossPercent}% (auto kill switch)</li>
            <li>Max 5 open positions at once</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
