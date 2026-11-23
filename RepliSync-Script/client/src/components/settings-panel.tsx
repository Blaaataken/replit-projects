import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, Eye, EyeOff, CheckCircle2, XCircle, Loader2, Save } from "lucide-react";
import { SiReplit } from "react-icons/si";
import type { Config } from "@shared/schema";

interface SettingsPanelProps {
  config: Config | undefined;
  isLoading: boolean;
}

export function SettingsPanel({ config, isLoading }: SettingsPanelProps) {
  const { toast } = useToast();
  const [replitToken, setReplitToken] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [showReplitToken, setShowReplitToken] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);

  useEffect(() => {
    if (config) {
      setReplitToken(config.replitToken || "");
      setGithubToken(config.githubToken || "");
      setGithubUsername(config.githubUsername || "");
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: async (data: { replitToken: string; githubToken: string; githubUsername: string }) => {
      return apiRequest("POST", "/api/config", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Settings Saved",
        description: "Your configuration has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testReplitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/test-replit", { token: replitToken });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "Replit Connected",
        description: "Successfully connected to Replit API.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testGithubMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/test-github", { token: githubToken, username: githubUsername });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({
        title: "GitHub Connected",
        description: "Successfully connected to GitHub API.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({ replitToken, githubToken, githubUsername });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SiReplit className="h-5 w-5" />
            <CardTitle className="text-lg">Replit Connection</CardTitle>
          </div>
          <CardDescription>
            Enter your Replit API token to fetch your projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="replit-token">API Token</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="replit-token"
                  type={showReplitToken ? "text" : "password"}
                  placeholder="Enter your Replit API token"
                  value={replitToken}
                  onChange={(e) => setReplitToken(e.target.value)}
                  data-testid="input-replit-token"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowReplitToken(!showReplitToken)}
                  data-testid="button-toggle-replit-token"
                >
                  {showReplitToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {config?.replitConnected ? (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                  Not connected
                </span>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => testReplitMutation.mutate()}
              disabled={!replitToken || testReplitMutation.isPending}
              data-testid="button-test-replit"
            >
              {testReplitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            <CardTitle className="text-lg">GitHub Connection</CardTitle>
          </div>
          <CardDescription>
            Enter your GitHub personal access token and username.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github-username">Username</Label>
            <Input
              id="github-username"
              type="text"
              placeholder="Enter your GitHub username"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              data-testid="input-github-username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github-token">Personal Access Token</Label>
            <div className="relative">
              <Input
                id="github-token"
                type={showGithubToken ? "text" : "password"}
                placeholder="Enter your GitHub token"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                data-testid="input-github-token"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowGithubToken(!showGithubToken)}
                data-testid="button-toggle-github-token"
              >
                {showGithubToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {config?.githubConnected ? (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                  Not connected
                </span>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => testGithubMutation.mutate()}
              disabled={!githubToken || !githubUsername || testGithubMutation.isPending}
              data-testid="button-test-github"
            >
              {testGithubMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full sm:w-auto"
        onClick={handleSave}
        disabled={saveMutation.isPending}
        data-testid="button-save-settings"
      >
        {saveMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </>
        )}
      </Button>
    </div>
  );
}
