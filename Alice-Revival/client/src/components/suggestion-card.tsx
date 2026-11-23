import { Lightbulb, Target, Bell, TrendingUp, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Suggestion } from "@shared/schema";

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAccept?: (suggestionId: string) => void;
  onDismiss?: (suggestionId: string) => void;
}

const categoryIcons: Record<string, typeof Lightbulb> = {
  goal: Target,
  task: Bell,
  insight: Lightbulb,
  reminder: Bell,
};

const priorityColors: Record<string, string> = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-chart-4/20 text-chart-4",
  low: "bg-muted text-muted-foreground",
};

export function SuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: SuggestionCardProps) {
  const Icon = categoryIcons[suggestion.category || "insight"] || Lightbulb;

  return (
    <Card
      className="overflow-visible"
      data-testid={`suggestion-card-${suggestion.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-medium text-sm">{suggestion.title}</h4>
              {suggestion.priority && (
                <Badge
                  variant="secondary"
                  className={cn("text-xs", priorityColors[suggestion.priority])}
                >
                  {suggestion.priority}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {suggestion.content}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-3">
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(suggestion.id)}
              data-testid={`button-dismiss-suggestion-${suggestion.id}`}
            >
              <X className="w-4 h-4 mr-1" />
              Dismiss
            </Button>
          )}
          {onAccept && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onAccept(suggestion.id)}
              data-testid={`button-accept-suggestion-${suggestion.id}`}
            >
              <Check className="w-4 h-4 mr-1" />
              Accept
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
