import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Copy,
} from "lucide-react";
import { PlatformIcon } from "@/components/platform-icon";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Post } from "@shared/schema";

export default function History() {
  const { toast } = useToast();

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest("DELETE", `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "The post has been removed from your history.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    },
  });

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Post content copied to clipboard.",
    });
  };

  const allPosts = posts || [];
  const publishedPosts = allPosts.filter((p) => p.status === "published");
  const scheduledPosts = allPosts.filter((p) => p.status === "scheduled");
  const draftPosts = allPosts.filter((p) => p.status === "draft");
  const failedPosts = allPosts.filter((p) => p.status === "failed");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Published</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const renderPostList = (postList: Post[]) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (postList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No posts here</h3>
          <p className="text-sm text-muted-foreground">
            Posts will appear here once you create them.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {postList.map((post) => (
          <Card key={post.id} data-testid={`history-post-${post.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyContent(post.content)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy content
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deletePost.mutate(post.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      {post.platforms.map((platform) => (
                        <div
                          key={platform}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-muted"
                        >
                          <PlatformIcon platform={platform} size={14} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(post.status)}
                      {getStatusBadge(post.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {post.publishedAt
                        ? format(new Date(post.publishedAt), "MMM d, yyyy 'at' h:mm a")
                        : post.scheduledAt
                        ? `Scheduled for ${format(new Date(post.scheduledAt), "MMM d, yyyy 'at' h:mm a")}`
                        : format(new Date(post.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold" data-testid="text-history-title">Post History</h1>
        <p className="text-muted-foreground">
          View and manage all your unified posts across platforms
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-all-posts">
              {allPosts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
              {publishedPosts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">
              {scheduledPosts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {failedPosts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="all" data-testid="tab-all-posts">
            All ({allPosts.length})
          </TabsTrigger>
          <TabsTrigger value="published" data-testid="tab-published">
            Published ({publishedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" data-testid="tab-scheduled">
            Scheduled ({scheduledPosts.length})
          </TabsTrigger>
          <TabsTrigger value="drafts" data-testid="tab-drafts">
            Drafts ({draftPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderPostList(allPosts)}
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          {renderPostList(publishedPosts)}
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          {renderPostList(scheduledPosts)}
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          {renderPostList(draftPosts)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
