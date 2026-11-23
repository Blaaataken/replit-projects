import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, Bell, Settings, LogOut, Home, Smartphone } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: unreadAlerts = 0 } = useQuery<any[], Error, number>({
    queryKey: ["/api/alerts"],
    select: (data: any[]) => data?.filter(alert => !alert.isRead).length || 0,
    retry: false,
  });

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      return user.email;
    }
    return "User";
  };

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity" data-testid="link-home">
              <Shield className="w-8 h-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-foreground">SecureTrack</h1>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <Link 
                href="/" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors hover:text-foreground ${
                  location === "/" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"
                }`}
                data-testid="link-dashboard"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link 
                href="/devices" 
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors hover:text-foreground ${
                  location === "/devices" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"
                }`}
                data-testid="link-devices"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Devices
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              {(unreadAlerts || 0) > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  data-testid="badge-notification-count"
                >
                  {unreadAlerts}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || ""} alt={getUserName()} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none" data-testid="text-user-name">{getUserName()}</p>
                    <p className="text-xs leading-none text-muted-foreground" data-testid="text-user-email">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" data-testid="menu-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="menu-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
