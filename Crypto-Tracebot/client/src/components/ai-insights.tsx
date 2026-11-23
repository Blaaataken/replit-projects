import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { AIInsight } from "@shared/schema";

interface AIInsightsProps {
  insights: AIInsight[];
  onRefresh: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
}

export function AIInsights({
  insights,
  onRefresh,
  isLoading = false,
  isRefreshing = false,
}: AIInsightsProps) {
  const getRecommendationIcon = (rec: AIInsight["recommendation"]) => {
    switch (rec) {
      case "buy":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "sell":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-amber-500" />;
    }
  };

  const getRecommendationColor = (rec: AIInsight["recommendation"]) => {
    switch (rec) {
      case "buy":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "sell":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return d.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="ai-insights">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Insights
          <Badge variant="secondary" className="ml-1">
            <Sparkles className="h-3 w-3 mr-1" />
            GPT-5
          </Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          data-testid="button-refresh-insights"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Brain className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No insights available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click refresh to generate AI insights
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 rounded-lg border bg-card/50"
                  data-testid={`insight-${insight.id}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{insight.symbol}</span>
                      <Badge
                        variant="outline"
                        className={getRecommendationColor(insight.recommendation)}
                      >
                        {getRecommendationIcon(insight.recommendation)}
                        <span className="ml-1 capitalize">
                          {insight.recommendation}
                        </span>
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(insight.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.reasoning}
                  </p>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      Confidence
                    </span>
                    <Progress
                      value={insight.confidence}
                      className="flex-1 h-2"
                    />
                    <span className="text-xs font-mono font-medium">
                      {insight.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
