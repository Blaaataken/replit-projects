import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, RefreshCw, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { PlatformIcon, getPlatformName, getPlatformColor } from "@/components/platform-icon";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SocialAccount, SocialPlatform } from "@shared/schema";

const ALL_PLATFORMS: SocialPlatform[] = ["twitter", "facebook", "linkedin", "instagram", "threads"];

export default function Accounts() {
  const { toast } = useToast();
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  const { data: accounts, isLoading } = useQuery<SocialAccount[]>({
    queryKey: ["/api/accounts"],
  });

  const connectAccount = useMutation({
    mutationFn: async (data: { platform: SocialPlatform; username: string; displayName: string }) => {
      const response = await apiRequest("POST", "/api/accounts", {
        platform: data.platform,
        username: data.username,
        displayName: data.displayName,
        connected: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Account connected!",
        description: `Your ${selectedPlatform ? getPlatformName(selectedPlatform) : ""} account has been connected.`,
      });
      setConnectDialogOpen(false);
      setUsername("");
      setDisplayName("");
      setSelectedPlatform(null);
    },
    onError: () => {
      toast({
        title: "Connection failed",
        description: "Unable to connect account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const disconnectAccount = useMutation({
    mutationFn: async (accountId: string) => {
      await apiRequest("DELETE", `/api/accounts/${accountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Account disconnected",
        description: "The account has been removed from your profile.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disconnect account.",
        variant: "destructive",
      });
    },
  });

  const handleConnect = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    setConnectDialogOpen(true);
  };

  const handleSubmitConnect = () => {
    if (!selectedPlatform || !username.trim() || !displayName.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    connectAccount.mutate({
      platform: selectedPlatform,
      username: username.trim(),
      displayName: displayName.trim(),
    });
  };

  const connectedPlatforms = accounts?.map((a) => a.platform) || [];
  const availablePlatforms = ALL_PLATFORMS.filter((p) => !connectedPlatforms.includes(p));

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold" data-testid="text-accounts-title">Connected Accounts</h1>
        <p className="text-muted-foreground">
          Manage your social media connections and link new platforms
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>
            Platforms currently connected to UnifyPost
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-md border p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : accounts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No accounts connected</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Connect your social media accounts to start posting to multiple platforms at once.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts?.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-4 rounded-md border p-4"
                  data-testid={`connected-account-${account.platform}`}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: getPlatformColor(account.platform) }}
                  >
                    <PlatformIcon platform={account.platform} size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{account.displayName}</p>
                      {account.connected ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Disconnected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      @{account.username} on {getPlatformName(account.platform)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      title="Refresh connection"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => disconnectAccount.mutate(account.id)}
                      disabled={disconnectAccount.isPending}
                      data-testid={`button-disconnect-${account.platform}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Platform</CardTitle>
          <CardDescription>
            Connect additional social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availablePlatforms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                All available platforms are connected!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availablePlatforms.map((platform) => (
                <div
                  key={platform}
                  className="flex flex-col items-center gap-3 rounded-md border p-6 text-center hover-elevate cursor-pointer"
                  onClick={() => handleConnect(platform)}
                  data-testid={`button-connect-${platform}`}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: getPlatformColor(platform) }}
                  >
                    <PlatformIcon platform={platform} size={28} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{getPlatformName(platform)}</p>
                    <p className="text-xs text-muted-foreground">Click to connect</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Platform Connections</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            UnifyPost connects to your social media accounts to post content on your behalf.
            For full API integration, each platform requires developer credentials:
          </p>
          <ul className="text-sm text-muted-foreground space-y-2 mt-4">
            <li className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
              <span><strong>X (Twitter)</strong>: Requires Twitter Developer Portal access</span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
              <span><strong>Facebook</strong>: Requires Meta Business Suite and Graph API</span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
              <span><strong>LinkedIn</strong>: Requires LinkedIn Developer application</span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
              <span><strong>Instagram</strong>: Requires Meta Business account</span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 shrink-0" />
              <span><strong>Threads</strong>: Uses Meta API (currently limited availability)</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedPlatform && (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: getPlatformColor(selectedPlatform) }}
                >
                  <PlatformIcon platform={selectedPlatform} size={16} className="text-white" />
                </div>
              )}
              Connect {selectedPlatform ? getPlatformName(selectedPlatform) : ""}
            </DialogTitle>
            <DialogDescription>
              Enter your account details to connect this platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="@yourusername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-connect-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                data-testid="input-connect-displayname"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitConnect}
              disabled={connectAccount.isPending}
              data-testid="button-confirm-connect"
            >
              {connectAccount.isPending ? "Connecting..." : "Connect Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
