import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Zap, Shield, Target, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { BotSettings as BotSettingsType } from "@shared/schema";

interface BotSettingsProps {
  settings: BotSettingsType | null;
  onSave: (settings: Partial<BotSettingsType>) => Promise<void>;
  onToggle: (active: boolean) => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
}

const strategies = [
  {
    id: "aggressive",
    name: "Aggressive",
    description: "High risk, high reward. 10% target, 15% stop-loss",
    icon: Zap,
    color: "text-amber-500",
  },
  {
    id: "moderate",
    name: "Moderate",
    description: "Balanced approach. 5% target, 7% stop-loss",
    icon: Target,
    color: "text-blue-500",
  },
  {
    id: "conservative",
    name: "Conservative",
    description: "Low risk. 3% target, 5% stop-loss",
    icon: Shield,
    color: "text-emerald-500",
  },
];

const tradingPairs = [
  "BTC/USDT",
  "ETH/USDT",
  "SOL/USDT",
  "BNB/USDT",
  "XRP/USDT",
  "ADA/USDT",
  "DOGE/USDT",
  "DOT/USDT",
];

export function BotSettingsComponent({
  settings,
  onSave,
  onToggle,
  isLoading = false,
  isSaving = false,
}: BotSettingsProps) {
  const [localSettings, setLocalSettings] = useState({
    isActive: false,
    strategy: "aggressive",
    profitTarget: 10,
    stopLoss: 15,
    maxTradeAmount: 1000,
    tradingPairs: ["BTC/USDT", "ETH/USDT"],
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        isActive: settings.isActive,
        strategy: settings.strategy,
        profitTarget: parseFloat(settings.profitTarget),
        stopLoss: parseFloat(settings.stopLoss),
        maxTradeAmount: parseFloat(settings.maxTradeAmount),
        tradingPairs: settings.tradingPairs,
      });
    }
  }, [settings]);

  const handleStrategyChange = (strategyId: string) => {
    let profitTarget = 10;
    let stopLoss = 15;

    if (strategyId === "moderate") {
      profitTarget = 5;
      stopLoss = 7;
    } else if (strategyId === "conservative") {
      profitTarget = 3;
      stopLoss = 5;
    }

    setLocalSettings({
      ...localSettings,
      strategy: strategyId,
      profitTarget,
      stopLoss,
    });
  };

  const handleSave = async () => {
    await onSave({
      strategy: localSettings.strategy,
      profitTarget: localSettings.profitTarget.toString(),
      stopLoss: localSettings.stopLoss.toString(),
      maxTradeAmount: localSettings.maxTradeAmount.toString(),
      tradingPairs: localSettings.tradingPairs,
    });
  };

  const handleToggle = async (checked: boolean) => {
    setLocalSettings({ ...localSettings, isActive: checked });
    await onToggle(checked);
  };

  const toggleTradingPair = (pair: string) => {
    const pairs = localSettings.tradingPairs.includes(pair)
      ? localSettings.tradingPairs.filter((p) => p !== pair)
      : [...localSettings.tradingPairs, pair];
    setLocalSettings({ ...localSettings, tradingPairs: pairs });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="bot-settings">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Trading Bot
            </CardTitle>
            <CardDescription className="mt-1">
              Configure your automated trading strategy
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={localSettings.isActive ? "default" : "secondary"}
              className={localSettings.isActive ? "bg-emerald-500" : ""}
            >
              {localSettings.isActive ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
              ) : (
                "Inactive"
              )}
            </Badge>
            <Switch
              checked={localSettings.isActive}
              onCheckedChange={handleToggle}
              data-testid="switch-bot-active"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Strategy</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {strategies.map((strategy) => (
              <button
                key={strategy.id}
                type="button"
                onClick={() => handleStrategyChange(strategy.id)}
                className={`p-4 rounded-lg border text-left transition-all hover-elevate active-elevate-2 ${
                  localSettings.strategy === strategy.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                data-testid={`button-strategy-${strategy.id}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <strategy.icon className={`h-5 w-5 ${strategy.color}`} />
                  <span className="font-medium">{strategy.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {strategy.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Label className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Profit Target
              </Label>
              <span className="font-mono text-sm font-medium">
                {localSettings.profitTarget}%
              </span>
            </div>
            <Slider
              value={[localSettings.profitTarget]}
              onValueChange={(v) =>
                setLocalSettings({ ...localSettings, profitTarget: v[0] })
              }
              min={1}
              max={30}
              step={0.5}
              data-testid="slider-profit-target"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Stop Loss
              </Label>
              <span className="font-mono text-sm font-medium">
                {localSettings.stopLoss}%
              </span>
            </div>
            <Slider
              value={[localSettings.stopLoss]}
              onValueChange={(v) =>
                setLocalSettings({ ...localSettings, stopLoss: v[0] })
              }
              min={1}
              max={30}
              step={0.5}
              data-testid="slider-stop-loss"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Max Trade Amount (USDT)</Label>
          <Input
            type="number"
            value={localSettings.maxTradeAmount}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                maxTradeAmount: parseFloat(e.target.value) || 0,
              })
            }
            className="font-mono"
            data-testid="input-max-trade-amount"
          />
        </div>

        <div className="space-y-3">
          <Label>Trading Pairs</Label>
          <div className="flex flex-wrap gap-2">
            {tradingPairs.map((pair) => (
              <Badge
                key={pair}
                variant={
                  localSettings.tradingPairs.includes(pair)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer toggle-elevate"
                onClick={() => toggleTradingPair(pair)}
                data-testid={`badge-pair-${pair}`}
              >
                {pair}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSave}
          disabled={isSaving}
          data-testid="button-save-settings"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
