import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { getUncachableGitHubClient } from "./lib/github";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/github/push", async (req, res) => {
    try {
      const { repoName, description, isPrivate } = req.body;
      const octokit = await getUncachableGitHubClient();
      
      const { data: user } = await octokit.users.getAuthenticated();
      
      let repo;
      try {
        const { data } = await octokit.repos.get({
          owner: user.login,
          repo: repoName,
        });
        repo = data;
      } catch {
        const { data } = await octokit.repos.createForAuthenticatedUser({
          name: repoName,
          description: description || "CryptoMiner - Multi-Algorithm Portable Mining App",
          private: isPrivate ?? false,
          auto_init: false,
        });
        repo = data;
      }
      
      res.json({
        success: true,
        repo: {
          name: repo.name,
          full_name: repo.full_name,
          html_url: repo.html_url,
          clone_url: repo.clone_url,
        },
        message: `Repository ready at ${repo.html_url}. Use Git commands to push your code.`,
      });
    } catch (error: any) {
      console.error("GitHub push error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to create/access GitHub repository" 
      });
    }
  });

  app.get("/api/github/user", async (_req, res) => {
    try {
      const octokit = await getUncachableGitHubClient();
      const { data: user } = await octokit.users.getAuthenticated();
      res.json({ 
        success: true, 
        user: { 
          login: user.login, 
          name: user.name,
          avatar_url: user.avatar_url 
        } 
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to get GitHub user" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
