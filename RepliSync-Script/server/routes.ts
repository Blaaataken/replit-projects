import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { syncRequestSchema } from "@shared/schema";
import { randomUUID } from "crypto";

const REPLIT_API_BASE = "https://api.replit.com/v0";
const GITHUB_API_BASE = "https://api.github.com";

async function fetchReplitProjects(token: string) {
  const response = await fetch(`${REPLIT_API_BASE}/projects`, {
    headers: {
      "Content-Type": "application/json",
      "api-key": token,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Replit API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function fetchReplitProjectFiles(token: string, projectId: string) {
  const response = await fetch(`${REPLIT_API_BASE}/projects/${projectId}/files`, {
    headers: {
      "Content-Type": "application/json",
      "api-key": token,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Replit API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function createGitHubRepo(token: string, repoName: string) {
  const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/vnd.github+json",
    },
    body: JSON.stringify({
      name: repoName,
      private: false,
      auto_init: false,
    }),
  });

  if (response.status === 422) {
    // Repo might already exist, try to get it
    return { exists: true };
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function uploadFileToGitHub(
  token: string,
  username: string,
  repoName: string,
  fileName: string,
  content: string,
  message: string
) {
  // Base64 encode the content
  const base64Content = Buffer.from(content).toString("base64");

  // First, try to get the file to see if it exists (for SHA)
  let sha: string | undefined;
  try {
    const getResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${username}/${repoName}/contents/${fileName}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
        },
      }
    );
    if (getResponse.ok) {
      const existingFile = await getResponse.json();
      sha = existingFile.sha;
    }
  } catch {
    // File doesn't exist, which is fine
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${username}/${repoName}/contents/${fileName}`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json",
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        ...(sha && { sha }),
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub upload error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/config", async (req, res) => {
    try {
      const config = await storage.getConfig();
      // Don't send tokens to frontend, just connection status
      res.json({
        id: config?.id,
        replitConnected: config?.replitConnected ?? false,
        githubConnected: config?.githubConnected ?? false,
        githubUsername: config?.githubUsername,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get config" });
    }
  });

  app.post("/api/config", async (req, res) => {
    try {
      const { replitToken, githubToken, githubUsername } = req.body;
      const config = await storage.saveConfig({
        replitToken,
        githubToken,
        githubUsername,
        replitConnected: !!replitToken,
        githubConnected: !!githubToken && !!githubUsername,
      });
      res.json({
        id: config.id,
        replitConnected: config.replitConnected,
        githubConnected: config.githubConnected,
        githubUsername: config.githubUsername,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to save config" });
    }
  });

  app.post("/api/test-replit", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
      
      // Test the connection by fetching projects
      const projects = await fetchReplitProjects(token);
      
      // Save the token and connection status
      const existingConfig = await storage.getConfig();
      await storage.saveConfig({
        replitToken: token,
        githubToken: existingConfig?.githubToken,
        githubUsername: existingConfig?.githubUsername,
        replitConnected: true,
        githubConnected: existingConfig?.githubConnected ?? false,
      });
      
      // Transform and store projects - preserve the Replit project ID/slug for file fetching
      const transformedProjects = Array.isArray(projects) ? projects.map((p: any) => ({
        id: String(p.id || p.slug || randomUUID()), // Use Replit's ID for API calls
        name: p.name || p.slug || p.title || "Unnamed Project",
        lastModified: p.updated_at || p.updatedAt || p.timeUpdated || new Date().toISOString(),
        fileCount: p.file_count || p.fileCount || 0,
        syncStatus: "not_synced" as const,
      })) : [];
      
      await storage.setProjects(transformedProjects);
      
      res.json({ success: true, projectCount: transformedProjects.length });
    } catch (error: any) {
      console.error("Replit connection error:", error);
      res.status(400).json({ error: error.message || "Failed to connect to Replit" });
    }
  });

  app.post("/api/test-github", async (req, res) => {
    try {
      const { token, username } = req.body;
      if (!token || !username) {
        return res.status(400).json({ error: "Token and username are required" });
      }
      
      // Test the connection by getting user info
      const userResponse = await fetch(`${GITHUB_API_BASE}/user`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
        },
      });
      
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        throw new Error(`GitHub API error: ${userResponse.status} - ${errorText}`);
      }
      
      const userData = await userResponse.json();
      
      // Verify username matches
      if (userData.login.toLowerCase() !== username.toLowerCase()) {
        throw new Error(`Username mismatch: token belongs to ${userData.login}`);
      }
      
      const existingConfig = await storage.getConfig();
      await storage.saveConfig({
        replitToken: existingConfig?.replitToken,
        githubToken: token,
        githubUsername: username,
        replitConnected: existingConfig?.replitConnected ?? false,
        githubConnected: true,
      });
      
      res.json({ success: true, username: userData.login });
    } catch (error: any) {
      console.error("GitHub connection error:", error);
      res.status(400).json({ error: error.message || "Failed to connect to GitHub" });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to get projects" });
    }
  });

  app.post("/api/projects/refresh", async (req, res) => {
    try {
      const config = await storage.getConfig();
      if (!config?.replitToken) {
        return res.status(400).json({ error: "Replit not connected" });
      }
      
      const projects = await fetchReplitProjects(config.replitToken);
      
      const existingProjects = await storage.getProjects();
      const existingStatusMap = new Map(existingProjects.map(p => [p.name, p.syncStatus]));
      
      const transformedProjects = Array.isArray(projects) ? projects.map((p: any) => ({
        id: String(p.id || p.slug || randomUUID()), // Use Replit's ID for API calls
        name: p.name || p.slug || p.title || "Unnamed Project",
        lastModified: p.updated_at || p.updatedAt || p.timeUpdated || new Date().toISOString(),
        fileCount: p.file_count || p.fileCount || 0,
        syncStatus: existingStatusMap.get(p.name || p.slug) || "not_synced" as const,
      })) : [];
      
      await storage.setProjects(transformedProjects);
      
      res.json({ success: true, projectCount: transformedProjects.length });
    } catch (error: any) {
      console.error("Refresh projects error:", error);
      res.status(500).json({ error: error.message || "Failed to refresh projects" });
    }
  });

  app.post("/api/sync", async (req, res) => {
    try {
      const parsed = syncRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      
      const config = await storage.getConfig();
      if (!config?.replitToken || !config?.githubToken || !config?.githubUsername) {
        return res.status(400).json({ error: "Both Replit and GitHub must be connected" });
      }
      
      const { projectIds } = parsed.data;
      const projects = await storage.getProjects();
      const results: { projectId: string; success: boolean; error?: string }[] = [];
      
      for (const projectId of projectIds) {
        const project = projects.find(p => p.id === projectId);
        if (!project) continue;
        
        try {
          // Create GitHub repo
          await createGitHubRepo(config.githubToken, project.name);
          
          // Fetch project files from Replit
          let filesResponse: any = null;
          let filesToUpload: Array<{ name: string; content: string }> = [];
          
          try {
            filesResponse = await fetchReplitProjectFiles(config.replitToken, projectId);
            
            // Handle different response formats from Replit API
            if (filesResponse) {
              // If response has a 'files' array
              if (Array.isArray(filesResponse.files)) {
                for (const file of filesResponse.files) {
                  const fileName = file.path || file.name || file.filename;
                  let fileContent = file.content;
                  
                  // Decode base64 content if needed
                  if (file.encoding === "base64" && fileContent) {
                    fileContent = Buffer.from(fileContent, "base64").toString("utf-8");
                  }
                  
                  if (fileName && fileContent) {
                    filesToUpload.push({ name: fileName, content: fileContent });
                  }
                }
              }
              // If response is directly an array
              else if (Array.isArray(filesResponse)) {
                for (const file of filesResponse) {
                  const fileName = file.path || file.name || file.filename;
                  let fileContent = file.content;
                  
                  if (file.encoding === "base64" && fileContent) {
                    fileContent = Buffer.from(fileContent, "base64").toString("utf-8");
                  }
                  
                  if (fileName && fileContent) {
                    filesToUpload.push({ name: fileName, content: fileContent });
                  }
                }
              }
            }
          } catch (fileError: any) {
            console.log(`Could not fetch files for ${project.name}: ${fileError.message}`);
          }
          
          // If no files found, create a placeholder README
          if (filesToUpload.length === 0) {
            filesToUpload = [{ 
              name: "README.md", 
              content: `# ${project.name}\n\nSynced from Replit.\n\n*Note: Project files could not be retrieved. Please ensure the Replit API token has the necessary permissions.*` 
            }];
          }
          
          // Upload each file to GitHub with rate limiting
          for (const file of filesToUpload) {
            try {
              await uploadFileToGitHub(
                config.githubToken,
                config.githubUsername,
                project.name,
                file.name,
                file.content,
                `Sync from Replit: ${file.name}`
              );
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (uploadError: any) {
              console.error(`Failed to upload ${file.name}:`, uploadError.message);
              // Continue with other files
            }
          }
          
          await storage.updateProjectStatus(projectId, "synced");
          await storage.addSyncHistory({
            projectId,
            projectName: project.name,
            status: "success",
            message: `Successfully synced to GitHub: github.com/${config.githubUsername}/${project.name}`,
            syncedAt: new Date().toISOString(),
          });
          
          results.push({ projectId, success: true });
        } catch (syncError: any) {
          console.error(`Sync error for ${project.name}:`, syncError);
          
          await storage.updateProjectStatus(projectId, "error");
          await storage.addSyncHistory({
            projectId,
            projectName: project.name,
            status: "error",
            message: syncError.message || "Unknown sync error",
            syncedAt: new Date().toISOString(),
          });
          
          results.push({ projectId, success: false, error: syncError.message });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      res.json({ 
        success: true, 
        syncedCount: successCount,
        failedCount: results.length - successCount,
        results 
      });
    } catch (error: any) {
      console.error("Sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync projects" });
    }
  });

  app.get("/api/sync-history", async (req, res) => {
    try {
      const history = await storage.getSyncHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to get sync history" });
    }
  });

  return httpServer;
}
