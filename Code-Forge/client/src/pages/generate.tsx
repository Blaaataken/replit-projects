import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileTree } from "@/components/file-tree";
import { CodePreview } from "@/components/code-preview";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { FileNode, GeneratedRepoResponse } from "@shared/schema";
import { 
  Sparkles, 
  Github, 
  Loader2, 
  CheckCircle2, 
  FolderTree, 
  FileCode,
  BookOpen,
  Lock,
  Globe,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const generateFormSchema = z.object({
  projectName: z.string().min(1, "Project name is required").regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  projectDescription: z.string().min(10, "Please provide a more detailed description (at least 10 characters)"),
  language: z.enum(["typescript", "javascript", "python", "go", "rust"]),
  framework: z.string().optional(),
  features: z.array(z.string()).optional(),
});

type GenerateFormData = z.infer<typeof generateFormSchema>;

const languageFrameworks: Record<string, string[]> = {
  typescript: ["React", "Next.js", "Express", "Fastify", "NestJS"],
  javascript: ["React", "Vue", "Express", "Fastify", "Vanilla"],
  python: ["FastAPI", "Flask", "Django", "CLI", "Library"],
  go: ["Gin", "Echo", "Fiber", "CLI", "Library"],
  rust: ["Actix", "Axum", "Rocket", "CLI", "Library"],
};

const commonFeatures = [
  "Authentication",
  "Database",
  "API Routes",
  "Testing",
  "Docker",
  "CI/CD",
  "Documentation",
  "Linting",
];

function findFileByName(files: FileNode[], name: string): FileNode | undefined {
  for (const file of files) {
    if (file.name === name) return file;
    if (file.type === "folder" && file.children) {
      const found = findFileByName(file.children, name);
      if (found) return found;
    }
  }
  return undefined;
}

export default function Generate() {
  const [generatedRepo, setGeneratedRepo] = useState<GeneratedRepoResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateFormData>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      projectName: "",
      projectDescription: "",
      language: "typescript",
      framework: "",
      features: [],
    },
  });

  const selectedLanguage = form.watch("language");
  const frameworks = languageFrameworks[selectedLanguage] || [];

  // Check GitHub connection
  const { data: githubUser, isLoading: isCheckingGithub } = useQuery({
    queryKey: ["/api/github/user"],
  });

  // Generate repository mutation
  const generateMutation = useMutation({
    mutationFn: async (data: GenerateFormData) => {
      const response = await apiRequest("POST", "/api/generate", data);
      return response.json() as Promise<GeneratedRepoResponse>;
    },
    onSuccess: (data) => {
      setGeneratedRepo(data);
      setSelectedFile(null);
      toast({
        title: "Repository Generated",
        description: "Your repository structure has been created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Push to GitHub mutation
  const pushMutation = useMutation({
    mutationFn: async () => {
      if (!generatedRepo) throw new Error("No repository to push");
      const response = await apiRequest("POST", "/api/github/create", {
        name: form.getValues("projectName"),
        description: generatedRepo.description,
        isPrivate,
        files: generatedRepo.files,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Pushed to GitHub",
        description: `Repository created at ${data.html_url}`,
      });
      window.open(data.html_url, "_blank");
    },
    onError: (error: Error) => {
      toast({
        title: "Push Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GenerateFormData) => {
    generateMutation.mutate(data);
  };

  const handleFileSelect = (file: FileNode) => {
    if (file.type === "file") {
      setSelectedFile(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Repository</h1>
        <p className="text-muted-foreground">
          Describe your project and let AI create a complete, production-ready repository.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Project Details
              </CardTitle>
              <CardDescription>
                Tell us about your project and we'll generate the perfect structure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="my-awesome-project" 
                            {...field} 
                            data-testid="input-project-name"
                          />
                        </FormControl>
                        <FormDescription>
                          Lowercase letters, numbers, and hyphens only
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A web application that helps users track their daily habits and goals..."
                            className="min-h-[120px] resize-none"
                            {...field}
                            data-testid="input-project-description"
                          />
                        </FormControl>
                        <FormDescription>
                          Be specific about features, integrations, and requirements
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-language">
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="go">Go</SelectItem>
                            <SelectItem value="rust">Rust</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="framework"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Framework (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-framework">
                              <SelectValue placeholder="Select a framework" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {frameworks.map((fw) => (
                              <SelectItem key={fw} value={fw.toLowerCase()}>
                                {fw}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="features"
                    render={() => (
                      <FormItem>
                        <FormLabel>Features</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          {commonFeatures.map((feature) => (
                            <FormField
                              key={feature}
                              control={form.control}
                              name="features"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={feature}
                                    className="flex items-center gap-2"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(feature)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), feature])
                                            : field.onChange(
                                                field.value?.filter((v) => v !== feature)
                                              );
                                        }}
                                        data-testid={`checkbox-feature-${feature.toLowerCase().replace(/\s+/g, '-')}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {feature}
                                    </FormLabel>
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

                  <Button 
                    type="submit" 
                    className="w-full gap-2"
                    disabled={generateMutation.isPending}
                    data-testid="button-generate"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Repository
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-3">
          {generateMutation.isPending ? (
            <Card className="h-full">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium mb-1">Generating your repository...</p>
                    <p className="text-sm text-muted-foreground">
                      AI is crafting the perfect structure
                    </p>
                  </div>
                  <div className="space-y-2 w-full max-w-md mt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : generatedRepo ? (
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-chart-2/10">
                      <CheckCircle2 className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{form.getValues("projectName")}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {generatedRepo.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generateMutation.mutate(form.getValues())}
                      data-testid="button-regenerate"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => pushMutation.mutate()}
                      disabled={pushMutation.isPending || !githubUser}
                      data-testid="button-push-github"
                    >
                      {pushMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Github className="h-4 w-4 mr-1" />
                      )}
                      Push to GitHub
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Visibility Toggle */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Repository Visibility:</span>
                  <div className="flex gap-2">
                    <Button
                      variant={!isPrivate ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsPrivate(false)}
                      data-testid="button-visibility-public"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Public
                    </Button>
                    <Button
                      variant={isPrivate ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsPrivate(true)}
                      data-testid="button-visibility-private"
                    >
                      <Lock className="h-4 w-4 mr-1" />
                      Private
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="files" className="w-full">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="files" className="gap-1" data-testid="tab-files">
                      <FolderTree className="h-4 w-4" />
                      Files
                    </TabsTrigger>
                    <TabsTrigger value="readme" className="gap-1" data-testid="tab-readme">
                      <BookOpen className="h-4 w-4" />
                      README
                    </TabsTrigger>
                    {selectedFile && (
                      <TabsTrigger value="preview" className="gap-1" data-testid="tab-preview">
                        <FileCode className="h-4 w-4" />
                        {selectedFile.name}
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="files" className="mt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">File Structure</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ScrollArea className="h-[400px]">
                            <FileTree 
                              files={generatedRepo.files} 
                              onFileSelect={handleFileSelect}
                              selectedFile={selectedFile?.name}
                            />
                          </ScrollArea>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {selectedFile ? selectedFile.name : "Select a file to preview"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ScrollArea className="h-[400px]">
                            {selectedFile && selectedFile.content ? (
                              <pre className="text-sm font-mono whitespace-pre-wrap">
                                {selectedFile.content}
                              </pre>
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                <p>Click on a file to see its contents</p>
                              </div>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="readme" className="mt-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-6">
                        <ScrollArea className="h-[450px]">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap font-mono text-sm">
                              {generatedRepo.readme}
                            </pre>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {selectedFile && (
                    <TabsContent value="preview" className="mt-4">
                      <CodePreview 
                        code={selectedFile.content || ""} 
                        fileName={selectedFile.name}
                      />
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="p-4 rounded-full bg-muted mb-6">
                    <FolderTree className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Repository Yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Fill out the form on the left and click "Generate Repository" to create 
                    your project structure with AI.
                  </p>
                  {!isCheckingGithub && !githubUser && (
                    <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">
                        GitHub is not connected. You won't be able to push repositories.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
