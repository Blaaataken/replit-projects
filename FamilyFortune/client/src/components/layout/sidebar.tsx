import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Settings,
  Store
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Store', href: '/store', icon: Store },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-card border-r border-border">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-vault text-primary-foreground text-sm"></i>
            </div>
            <span className="ml-2 text-xl font-bold text-foreground">DigitalVault</span>
          </div>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? "bg-primary/10 text-primary border-r-3 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                  )}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>
        
        <div className="flex-shrink-0 px-2 pb-4">
          <div className="flex items-center px-2 py-2">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <i className="fas fa-user text-muted-foreground text-sm"></i>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
                {user?.firstName || user?.email || 'Creator'}
              </p>
              <p className="text-xs text-muted-foreground">Creator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
