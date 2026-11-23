import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProductForm from "@/components/products/product-form";
import { Search, Plus, Bell, Menu } from "lucide-react";

export default function Header() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-2 text-lg font-semibold text-foreground">DigitalVault</span>
        </div>
        
        <div className="flex-1 flex justify-center lg:justify-start lg:ml-8">
          <div className="max-w-lg w-full lg:max-w-xs">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                className="pl-10"
                placeholder="Search products..."
                type="search"
                data-testid="input-header-search"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-header-add-product">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
          
          <Button variant="ghost" size="sm" data-testid="button-notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = "/api/logout"}
            data-testid="button-logout"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
