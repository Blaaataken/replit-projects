import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Target, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalCard } from "@/components/goal-card";
import { GoalForm } from "@/components/goal-form";
import { StatsCard } from "@/components/stats-card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Goal } from "@shared/schema";

export default function GoalsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const { toast } = useToast();

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsFormOpen(false);
      toast({ title: "Goal created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return await apiRequest("PATCH", `/api/goals/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsFormOpen(false);
      setEditingGoal(undefined);
      toast({ title: "Goal updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update goal", variant: "destructive" });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete goal", variant: "destructive" });
    },
  });

  const handleSubmit = (values: any) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, ...values });
    } else {
      createGoalMutation.mutate(values);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleUpdateStatus = (goalId: string, status: string) => {
    const progress = status === "completed" ? 100 : undefined;
    updateGoalMutation.mutate({ id: goalId, status, ...(progress !== undefined && { progress }) });
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");
  const pausedGoals = goals.filter((g) => g.status === "paused");
  const avgProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
    : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-2xl font-bold">Goals</h1>
            <p className="text-muted-foreground">Track your progress and achieve your dreams</p>
          </div>
          <Button onClick={() => { setEditingGoal(undefined); setIsFormOpen(true); }} data-testid="button-add-goal">
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Active Goals"
            value={activeGoals.length}
            subtitle="In progress"
            icon={Target}
          />
          <StatsCard
            title="Completed"
            value={completedGoals.length}
            subtitle="Goals achieved"
            icon={CheckCircle2}
          />
          <StatsCard
            title="Avg Progress"
            value={`${avgProgress}%`}
            subtitle="Across active goals"
            icon={TrendingUp}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6" data-testid="tabs-goals">
            <TabsTrigger value="active" data-testid="tab-active">
              Active ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="paused" data-testid="tab-paused">
              Paused ({pausedGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Completed ({completedGoals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : activeGoals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No active goals</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start by adding your first goal
                </p>
                <Button onClick={() => setIsFormOpen(true)} data-testid="button-add-first-goal">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Goal
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={handleEdit}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={(id) => deleteGoalMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="paused">
            {pausedGoals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No paused goals
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pausedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={handleEdit}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={(id) => deleteGoalMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedGoals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No completed goals yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={handleEdit}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={(id) => deleteGoalMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
          </DialogHeader>
          <GoalForm
            goal={editingGoal}
            onSubmit={handleSubmit}
            onCancel={() => { setIsFormOpen(false); setEditingGoal(undefined); }}
            isLoading={createGoalMutation.isPending || updateGoalMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
