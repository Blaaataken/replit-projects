import { useQuery, useMutation } from "@tanstack/react-query";
import { Lightbulb, Bell, TrendingUp, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuggestionCard } from "@/components/suggestion-card";
import { StatsCard } from "@/components/stats-card";
import { AliceAvatar } from "@/components/alice-avatar";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Suggestion } from "@shared/schema";

export default function InsightsPage() {
  const { toast } = useToast();

  const { data: suggestions = [], isLoading } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions"],
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/suggestions/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
    },
  });

  const handleAccept = (id: string) => {
    updateSuggestionMutation.mutate({ id, status: "accepted" });
    toast({ title: "Suggestion accepted" });
  };

  const handleDismiss = (id: string) => {
    updateSuggestionMutation.mutate({ id, status: "dismissed" });
    toast({ title: "Suggestion dismissed" });
  };

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const acceptedSuggestions = suggestions.filter((s) => s.status === "accepted");
  const highPriority = pendingSuggestions.filter((s) => s.priority === "high");

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-md bg-primary/10">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Insights</h1>
            <p className="text-muted-foreground">Proactive suggestions from Alice</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Pending"
            value={pendingSuggestions.length}
            subtitle="Awaiting review"
            icon={Bell}
          />
          <StatsCard
            title="High Priority"
            value={highPriority.length}
            subtitle="Need attention"
            icon={TrendingUp}
          />
          <StatsCard
            title="Accepted"
            value={acceptedSuggestions.length}
            subtitle="Implemented"
            icon={Sparkles}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6" data-testid="tabs-suggestions">
            <TabsTrigger value="pending" data-testid="tab-pending-suggestions">
              Pending ({pendingSuggestions.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" data-testid="tab-accepted-suggestions">
              Accepted ({acceptedSuggestions.length})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all-suggestions">
              All ({suggestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : pendingSuggestions.length === 0 ? (
              <div className="text-center py-12">
                <AliceAvatar size="lg" className="mx-auto mb-4" />
                <h3 className="font-medium mb-2">No pending suggestions</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  As you interact with Alice and work on your goals, 
                  I'll provide personalized suggestions to help you succeed.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-w-2xl">
                {pendingSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAccept={handleAccept}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accepted">
            {acceptedSuggestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No accepted suggestions yet
              </div>
            ) : (
              <div className="space-y-4 max-w-2xl">
                {acceptedSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {suggestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No suggestions yet
              </div>
            ) : (
              <div className="space-y-4 max-w-2xl">
                {suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAccept={suggestion.status === "pending" ? handleAccept : undefined}
                    onDismiss={suggestion.status === "pending" ? handleDismiss : undefined}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}
