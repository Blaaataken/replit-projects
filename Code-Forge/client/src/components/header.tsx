import { Github, Sparkles, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  githubConnected?: boolean;
  githubUser?: string;
}

export function Header({ githubConnected, githubUser }: HeaderProps) {
  const [location] = useLocation();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">RepoGen AI</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/">
            <span
              className={`text-sm font-medium transition-colors hover:text-foreground cursor-pointer ${
                location === "/" ? "text-foreground" : "text-muted-foreground"
              }`}
              data-testid="link-nav-home"
            >
              Home
            </span>
          </Link>
          <Link href="/generate">
            <span
              className={`text-sm font-medium transition-colors hover:text-foreground cursor-pointer ${
                location === "/generate" ? "text-foreground" : "text-muted-foreground"
              }`}
              data-testid="link-nav-generate"
            >
              Generate
            </span>
          </Link>
          <Link href="/pricing">
            <span
              className={`text-sm font-medium transition-colors hover:text-foreground cursor-pointer ${
                location === "/pricing" ? "text-foreground" : "text-muted-foreground"
              }`}
              data-testid="link-nav-pricing"
            >
              Pricing
            </span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {githubConnected && githubUser && (
            <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5">
              <Github className="h-3 w-3" />
              {githubUser}
            </Badge>
          )}
          
          <ThemeToggle />

          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                    <AvatarFallback>
                      {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="cursor-pointer" data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" asChild data-testid="button-login">
              <a href="/api/login">
                <LogIn className="h-4 w-4 mr-2" />
                Log in
              </a>
            </Button>
          )}

          <Link href="/generate">
            <Button data-testid="button-cta-generate">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
