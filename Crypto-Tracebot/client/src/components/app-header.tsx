import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Bell, Settings, LogOut, User, TrendingUp } from "lucide-react";

interface AppHeaderProps {
  botActive: boolean;
  notifications?: number;
}

export function AppHeader({ botActive, notifications = 0 }: AppHeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      data-testid="app-header"
    >
      <div className="container mx-auto h-full flex items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">CryptoTrader Pro</h1>
              <p className="text-xs text-muted-foreground">AI Trading Bot</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={botActive ? "default" : "secondary"}
            className={`${
              botActive ? "bg-emerald-500 text-white" : ""
            } gap-1`}
            data-testid="badge-bot-status"
          >
            <Bot className="h-3 w-3" />
            {botActive ? "Bot Active" : "Bot Inactive"}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                {notifications > 9 ? "9+" : notifications}
              </span>
            )}
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="button-user-menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="menu-profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                data-testid="menu-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
