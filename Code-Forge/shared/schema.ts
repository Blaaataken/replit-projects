import { z } from "zod";

// Export auth models for Replit Auth integration
export * from "./models/auth";

// Repository file structure - defined as a recursive Zod type
export interface FileNode {
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
}

export const fileSchema: z.ZodType<FileNode> = z.lazy(() =>
  z.object({
    name: z.string(),
    type: z.enum(["file", "folder"]),
    content: z.string().optional(),
    children: z.array(fileSchema).optional(),
  })
);

// Repository generation request schema
export const generateRepoRequestSchema = z.object({
  projectDescription: z.string().min(10, "Please provide a more detailed description"),
  projectName: z.string().min(1, "Project name is required"),
  language: z.enum(["typescript", "javascript", "python", "go", "rust"]),
  framework: z.string().optional(),
  features: z.array(z.string()).optional(),
});

export type GenerateRepoRequest = z.infer<typeof generateRepoRequestSchema>;

// GitHub repo creation request
export const createGithubRepoSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
  files: z.array(fileSchema),
});

export type CreateGithubRepoRequest = z.infer<typeof createGithubRepoSchema>;

// Generated repository response
export const generatedRepoResponseSchema = z.object({
  name: z.string(),
  description: z.string(),
  files: z.array(fileSchema),
  readme: z.string(),
  suggestedFeatures: z.array(z.string()).optional(),
});

export type GeneratedRepoResponse = z.infer<typeof generatedRepoResponseSchema>;
