import { Target, Calendar, MoreHorizontal, CheckCircle2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Goal } from "@shared/schema";
import { format } from "date-fns";

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onUpdateProgress?: (goalId: string, progress: number) => void;
  onUpdateStatus?: (goalId: string, status: string) => void;
  onDelete?: (goalId: string) => void;
}

const categoryColors: Record<string, string> = {
  health: "bg-chart-2/20 text-chart-2",
  career: "bg-chart-1/20 text-chart-1",
  personal: "bg-chart-3/20 text-chart-3",
  financial: "bg-chart-4/20 text-chart-4",
  learning: "bg-chart-5/20 text-chart-5",
};

export function GoalCard({
  goal,
  onEdit,
  onUpdateProgress,
  onUpdateStatus,
  onDelete,
}: GoalCardProps) {
  const isCompleted = goal.status === "completed";
  const isPaused = goal.status === "paused";

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isCompleted && "opacity-75"
      )}
      data-testid={`goal-card-${goal.id}`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={cn(
              "font-semibold text-base truncate",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {goal.title}
            </h3>
            {goal.category && (
              <Badge
                variant="secondary"
                className={cn("text-xs", categoryColors[goal.category] || "")}
              >
                {goal.category}
              </Badge>
            )}
          </div>
          {goal.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {goal.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-goal-menu-${goal.id}`}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                Edit Goal
              </DropdownMenuItem>
            )}
            {onUpdateStatus && !isCompleted && (
              <DropdownMenuItem onClick={() => onUpdateStatus(goal.id, "completed")}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </DropdownMenuItem>
            )}
            {onUpdateStatus && isPaused && (
              <DropdownMenuItem onClick={() => onUpdateStatus(goal.id, "active")}>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </DropdownMenuItem>
            )}
            {onUpdateStatus && !isPaused && !isCompleted && (
              <DropdownMenuItem onClick={() => onUpdateStatus(goal.id, "paused")}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(goal.id)}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>
        {goal.targetDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Target: {format(new Date(goal.targetDate), "MMM d, yyyy")}</span>
          </div>
        )}
        {isPaused && (
          <Badge variant="secondary" className="bg-muted">
            <Pause className="w-3 h-3 mr-1" />
            Paused
          </Badge>
        )}
        {isCompleted && (
          <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
