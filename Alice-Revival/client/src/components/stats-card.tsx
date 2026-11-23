import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-visible", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">{value}</span>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-chart-2" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="p-3 rounded-md bg-primary/10 text-primary flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
