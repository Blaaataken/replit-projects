import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  Clock, 
  CircleDot,
  Github,
  Settings,
  History,
  FolderOpen,
  Loader2,
  CheckCircle2,
  XCircle,
  FileCode2
} from "lucide-react";
import { SiReplit } from "react-icons/si";
import type { ReplitProject, Config, SyncHistory } from "@shared/schema";
import { SettingsPanel } from "@/components/settings-panel";
import { SyncProgressModal } from "@/components/sync-progress-modal";
import { format } from "date-fns";

type NavSection = "projects" | "settings" | "history";

export default function Home() {
  const { toast } = useToast();
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<NavSection>("projects");
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncingProjects, setSyncingProjects] = useState<string[]>([]);

  const { data: config, isLoading: configLoading } = useQuery<Config>({
    queryKey: ["/api/config"],
  });

  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = useQuery<ReplitProject[]>({
    queryKey: ["/api/projects"],
    enabled: !!config?.replitConnected,
  });

  const { data: syncHistory, isLoading: historyLoading } = useQuery<SyncHistory[]>({
    queryKey: ["/api/sync-history"],
  });

  const [syncComplete, setSyncComplete] = useState(false);

  const syncMutation = useMutation({
    mutationFn: async (projectIds: string[]) => {
      return apiRequest("POST", "/api/sync", { projectIds });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/sync-history"] });
      setSyncComplete(true);
      toast({
        title: "Sync Complete",
        description: "Projects have been synced to GitHub successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
      setSyncModalOpen(false);
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/projects/refresh", {});
    },
    onSuccess: () => {
      refetchProjects();
      toast({
        title: "Projects Refreshed",
        description: "Project list has been updated.",
      });
    },
  });

  const handleSelectAll = () => {
    if (!projects) return;
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map(p => p.id)));
    }
  };

  const handleProjectSelect = (projectId: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const handleSync = () => {
    if (selectedProjects.size === 0) {
      toast({
        title: "No Projects Selected",
        description: "Please select at least one project to sync.",
        variant: "destructive",
      });
      return;
    }
    const projectIds = Array.from(selectedProjects);
    setSyncingProjects(projectIds);
    setSyncComplete(false);
    setSyncModalOpen(true);
    syncMutation.mutate(projectIds);
  };

  const handleModalClose = () => {
    setSyncModalOpen(false);
    if (syncComplete) {
      setSelectedProjects(new Set());
      setSyncComplete(false);
    }
  };

  const getStatusIcon = (status: ReplitProject["syncStatus"]) => {
    switch (status) {
      case "synced":
        return <Check className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CircleDot className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ReplitProject["syncStatus"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      synced: "default",
      pending: "secondary",
      error: "destructive",
      not_synced: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="text-xs">
        {status === "not_synced" ? "Not Synced" : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderProjectCard = (project: ReplitProject) => (
    <Card 
      key={project.id} 
      className="hover-elevate cursor-pointer transition-all"
      onClick={() => handleProjectSelect(project.id)}
      data-testid={`card-project-${project.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={selectedProjects.has(project.id)}
            onCheckedChange={() => handleProjectSelect(project.id)}
            className="mt-1 h-5 w-5"
            data-testid={`checkbox-project-${project.id}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate" data-testid={`text-project-name-${project.id}`}>{project.name}</h3>
              {getStatusBadge(project.syncStatus)}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileCode2 className="h-3.5 w-3.5" />
                {project.fileCount} files
              </span>
              <span>Modified {format(new Date(project.lastModified), "MMM d, yyyy")}</span>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusIcon(project.syncStatus)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderNavButton = (section: NavSection, icon: React.ReactNode, label: string) => (
    <Button
      variant={activeSection === section ? "secondary" : "ghost"}
      className="w-full justify-start gap-2"
      onClick={() => setActiveSection(section)}
      data-testid={`button-nav-${section}`}
    >
      {icon}
      {label}
    </Button>
  );

  const renderProjectsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">Your Replit Projects</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={!projects || projects.length === 0}
            data-testid="button-select-all"
          >
            {projects && selectedProjects.size === projects.length ? "Deselect All" : "Select All"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {!config?.replitConnected ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <SiReplit className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Connect Your Replit Account</h3>
            <p className="text-muted-foreground mb-4">
              Add your Replit API token in Settings to view and sync your projects.
            </p>
            <Button onClick={() => setActiveSection("settings")} data-testid="button-connect-replit">
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      ) : projectsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="space-y-3">
          {projects.map(renderProjectCard)}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Projects Found</h3>
            <p className="text-muted-foreground">
              Create some projects on Replit, then refresh to see them here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderHistorySection = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Sync History</h2>
      {historyLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : syncHistory && syncHistory.length > 0 ? (
        <div className="space-y-3">
          {syncHistory.map((entry) => (
            <Card key={entry.id} data-testid={`card-history-${entry.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {entry.status === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : entry.status === "error" ? (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  ) : (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.projectName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.syncedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Badge variant={entry.status === "success" ? "default" : entry.status === "error" ? "destructive" : "secondary"}>
                    {entry.status}
                  </Badge>
                </div>
                {entry.message && (
                  <p className="text-sm text-muted-foreground mt-2 pl-8">{entry.message}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Sync History</h3>
            <p className="text-muted-foreground">
              Your sync history will appear here after you sync projects.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SiReplit className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Replit to GitHub Sync</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <SiReplit className="h-4 w-4" />
                <span className={`h-2 w-2 rounded-full ${config?.replitConnected ? "bg-green-500" : "bg-muted-foreground"}`} />
              </div>
              <div className="flex items-center gap-1.5">
                <Github className="h-4 w-4" />
                <span className={`h-2 w-2 rounded-full ${config?.githubConnected ? "bg-green-500" : "bg-muted-foreground"}`} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="space-y-2">
            {renderNavButton("projects", <FolderOpen className="h-4 w-4" />, "Projects")}
            {renderNavButton("settings", <Settings className="h-4 w-4" />, "Settings")}
            {renderNavButton("history", <History className="h-4 w-4" />, "History")}
          </aside>

          <main className="min-w-0">
            {activeSection === "projects" && renderProjectsSection()}
            {activeSection === "settings" && <SettingsPanel config={config} isLoading={configLoading} />}
            {activeSection === "history" && renderHistorySection()}
          </main>
        </div>
      </div>

      {activeSection === "projects" && config?.replitConnected && config?.githubConnected && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t lg:hidden">
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleSync}
            disabled={selectedProjects.size === 0 || syncMutation.isPending}
            data-testid="button-sync-mobile"
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Github className="h-4 w-4 mr-2" />
                Sync {selectedProjects.size > 0 ? `(${selectedProjects.size})` : ""} to GitHub
              </>
            )}
          </Button>
        </div>
      )}

      {activeSection === "projects" && config?.replitConnected && config?.githubConnected && (
        <div className="hidden lg:block fixed bottom-6 right-6">
          <Button 
            size="lg"
            onClick={handleSync}
            disabled={selectedProjects.size === 0 || syncMutation.isPending}
            data-testid="button-sync-desktop"
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Github className="h-4 w-4 mr-2" />
                Sync {selectedProjects.size > 0 ? `${selectedProjects.size} Project${selectedProjects.size > 1 ? "s" : ""}` : "Selected"} to GitHub
              </>
            )}
          </Button>
        </div>
      )}

      <SyncProgressModal
        open={syncModalOpen}
        onOpenChange={handleModalClose}
        projects={projects?.filter(p => syncingProjects.includes(p.id)) || []}
        isPending={syncMutation.isPending}
        isComplete={syncComplete}
      />
    </div>
  );
}
