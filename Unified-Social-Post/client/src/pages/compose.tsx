import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Send, Clock, AlertCircle, Image, Link as LinkIcon } from "lucide-react";
import { PlatformIcon, getPlatformName } from "@/components/platform-icon";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SocialAccount, SocialPlatform, Post } from "@shared/schema";
import { platformInfo } from "@shared/schema";

const composeFormSchema = z.object({
  content: z.string().min(1, "Post content is required").max(63206, "Content too long"),
  platforms: z.array(z.enum(["twitter", "facebook", "linkedin", "instagram", "threads"]))
    .min(1, "Select at least one platform"),
});

type ComposeFormValues = z.infer<typeof composeFormSchema>;

export default function Compose() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [charCount, setCharCount] = useState(0);

  const { data: accounts, isLoading: accountsLoading } = useQuery<SocialAccount[]>({
    queryKey: ["/api/accounts"],
  });

  const connectedAccounts = accounts?.filter((a) => a.connected) || [];

  const form = useForm<ComposeFormValues>({
    resolver: zodResolver(composeFormSchema),
    defaultValues: {
      content: "",
      platforms: [],
    },
  });

  const selectedPlatforms = form.watch("platforms");
  const content = form.watch("content");

  const createPost = useMutation({
    mutationFn: async (data: ComposeFormValues) => {
      const response = await apiRequest("POST", "/api/posts", {
        content: data.content,
        platforms: data.platforms,
        status: "published",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created!",
        description: "Your post has been sent to all selected platforms.",
      });
      navigate("/history");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const schedulePost = useMutation({
    mutationFn: async (data: ComposeFormValues) => {
      const response = await apiRequest("POST", "/api/posts", {
        content: data.content,
        platforms: data.platforms,
        status: "scheduled",
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post scheduled!",
        description: "Your post has been scheduled for later.",
      });
      navigate("/history");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ComposeFormValues) => {
    createPost.mutate(data);
  };

  const handleSchedule = () => {
    const data = form.getValues();
    if (form.formState.isValid) {
      schedulePost.mutate(data);
    } else {
      form.trigger();
    }
  };

  const getCharLimitWarnings = () => {
    const warnings: { platform: SocialPlatform; limit: number; exceeded: boolean }[] = [];
    selectedPlatforms.forEach((platform) => {
      const limit = platformInfo[platform].maxLength;
      if (charCount > limit * 0.8) {
        warnings.push({ platform, limit, exceeded: charCount > limit });
      }
    });
    return warnings;
  };

  const charWarnings = getCharLimitWarnings();

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold" data-testid="text-compose-title">Create Post</h1>
        <p className="text-muted-foreground">
          Write your message once and share it across all your connected platforms
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compose Your Message</CardTitle>
              <CardDescription>
                Craft your content for multiple platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What's on your mind? Share your thoughts, updates, or news..."
                        className="min-h-[200px] resize-none text-base"
                        data-testid="input-post-content"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setCharCount(e.target.value.length);
                        }}
                      />
                    </FormControl>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" disabled>
                          <Image className="h-4 w-4 mr-1" />
                          Add Image
                        </Button>
                        <Button type="button" variant="outline" size="sm" disabled>
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Add Link
                        </Button>
                      </div>
                      <span className="text-sm text-muted-foreground" data-testid="text-char-count">
                        {charCount} characters
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {charWarnings.length > 0 && (
                <div className="space-y-2">
                  {charWarnings.map((warning) => (
                    <div
                      key={warning.platform}
                      className={`flex items-center gap-2 rounded-md p-2 text-sm ${
                        warning.exceeded
                          ? "bg-destructive/10 text-destructive"
                          : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
                      }`}
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>
                        {getPlatformName(warning.platform)}:{" "}
                        {warning.exceeded
                          ? `Exceeds ${warning.limit} character limit by ${charCount - warning.limit}`
                          : `Approaching ${warning.limit} character limit`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Platforms</CardTitle>
              <CardDescription>
                Choose which platforms to post to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-md" />
                  ))}
                </div>
              ) : connectedAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No accounts connected. Connect your social media accounts first.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/accounts")}
                    data-testid="button-go-to-accounts"
                  >
                    Connect Accounts
                  </Button>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="platforms"
                  render={() => (
                    <FormItem>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {connectedAccounts.map((account) => (
                          <FormField
                            key={account.id}
                            control={form.control}
                            name="platforms"
                            render={({ field }) => {
                              const isSelected = field.value.includes(account.platform);
                              return (
                                <FormItem>
                                  <FormControl>
                                    <label
                                      className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 transition-colors ${
                                        isSelected
                                          ? "border-primary bg-primary/5"
                                          : "hover:bg-muted/50"
                                      }`}
                                      data-testid={`platform-select-${account.platform}`}
                                    >
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          const updated = checked
                                            ? [...field.value, account.platform]
                                            : field.value.filter((p) => p !== account.platform);
                                          field.onChange(updated);
                                        }}
                                      />
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                        <PlatformIcon platform={account.platform} size={16} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {getPlatformName(account.platform)}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          @{account.username}
                                        </p>
                                      </div>
                                    </label>
                                  </FormControl>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {selectedPlatforms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  How your post will appear on each platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedPlatforms.map((platform) => {
                    const account = connectedAccounts.find((a) => a.platform === platform);
                    const limit = platformInfo[platform].maxLength;
                    const isOverLimit = content.length > limit;

                    return (
                      <div
                        key={platform}
                        className="rounded-md border p-4"
                        data-testid={`preview-${platform}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <PlatformIcon platform={platform} size={18} />
                          </div>
                          <div>
                            <p className="font-medium">{account?.displayName || "Your Name"}</p>
                            <p className="text-sm text-muted-foreground">
                              @{account?.username || "username"}
                            </p>
                          </div>
                          <Badge
                            variant={isOverLimit ? "destructive" : "secondary"}
                            className="ml-auto"
                          >
                            {content.length}/{limit}
                          </Badge>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {content || "Your post content will appear here..."}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-end gap-3 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={handleSchedule}
              disabled={schedulePost.isPending || createPost.isPending}
              data-testid="button-schedule-post"
            >
              <Clock className="mr-2 h-4 w-4" />
              Schedule for Later
            </Button>
            <Button
              type="submit"
              disabled={createPost.isPending || schedulePost.isPending}
              data-testid="button-post-now"
            >
              <Send className="mr-2 h-4 w-4" />
              {createPost.isPending ? "Posting..." : "Post Now"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
