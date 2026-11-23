import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PenSquare, Users, TrendingUp, Clock, CheckCircle2, AlertCircle, Plus, History } from "lucide-react";
import { PlatformIcon, getPlatformName } from "@/components/platform-icon";
import type { SocialAccount, Post } from "@shared/schema";

export default function Dashboard() {
  const { data: accounts, isLoading: accountsLoading } = useQuery<SocialAccount[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const connectedAccounts = accounts?.filter((a) => a.connected) || [];
  const recentPosts = posts?.slice(0, 5) || [];
  const publishedPosts = posts?.filter((p) => p.status === "published") || [];
  const scheduledPosts = posts?.filter((p) => p.status === "scheduled") || [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage all your social media platforms from one place
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-connected-count">
                  {connectedAccounts.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {connectedAccounts.length === 0
                    ? "No platforms connected"
                    : `${connectedAccounts.length} platform${connectedAccounts.length === 1 ? "" : "s"} ready`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-posts">
                  {posts?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all platforms
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-published-posts">
                  {publishedPosts.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully delivered
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-scheduled-posts">
                  {scheduledPosts.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Waiting to publish
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Connected Platforms</CardTitle>
              <CardDescription>Your linked social media accounts</CardDescription>
            </div>
            <Link href="/accounts">
              <Button variant="outline" size="sm" data-testid="button-manage-accounts">
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : connectedAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  No accounts connected yet
                </p>
                <Link href="/accounts">
                  <Button size="sm" data-testid="button-connect-first-account">
                    Connect your first account
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {connectedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 rounded-md border p-3"
                    data-testid={`account-card-${account.platform}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <PlatformIcon platform={account.platform} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{account.displayName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        @{account.username}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {getPlatformName(account.platform)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Your latest unified posts</CardDescription>
            </div>
            <Link href="/compose">
              <Button size="sm" data-testid="button-create-post">
                <PenSquare className="mr-1 h-3 w-3" />
                Create Post
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <PenSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  No posts yet. Start creating!
                </p>
                <Link href="/compose">
                  <Button size="sm" data-testid="button-create-first-post">
                    Create your first post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="space-y-2 rounded-md border p-3"
                    data-testid={`post-card-${post.id}`}
                  >
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        {post.platforms.map((platform) => (
                          <div
                            key={platform}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-muted"
                          >
                            <PlatformIcon platform={platform} size={12} />
                          </div>
                        ))}
                      </div>
                      <Badge
                        variant={
                          post.status === "published"
                            ? "default"
                            : post.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {post.status === "published" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {post.status === "failed" && <AlertCircle className="mr-1 h-3 w-3" />}
                        {post.status === "scheduled" && <Clock className="mr-1 h-3 w-3" />}
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with UnifyPost</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/compose">
              <div className="flex items-center gap-4 rounded-md border p-4 hover-elevate cursor-pointer">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <PenSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Create Post</p>
                  <p className="text-sm text-muted-foreground">
                    Write once, post everywhere
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/accounts">
              <div className="flex items-center gap-4 rounded-md border p-4 hover-elevate cursor-pointer">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Manage Accounts</p>
                  <p className="text-sm text-muted-foreground">
                    Connect your platforms
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/history">
              <div className="flex items-center gap-4 rounded-md border p-4 hover-elevate cursor-pointer">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                  <History className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">View History</p>
                  <p className="text-sm text-muted-foreground">
                    See all your posts
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
