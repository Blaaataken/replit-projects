import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductForm from "@/components/products/product-form";
import { Upload, Eye, TrendingUp, Settings } from "lucide-react";

export default function QuickActions() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleUploadSuccess = () => {
    setIsUploadDialogOpen(false);
  };

  const actions = [
    {
      title: "Upload Product",
      description: "Add new digital product",
      icon: Upload,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      onClick: () => setIsUploadDialogOpen(true),
      testId: "button-quick-upload"
    },
    {
      title: "View Store",
      description: "See your public storefront",
      icon: Eye,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      onClick: () => window.open("/store", "_blank"),
      testId: "button-quick-view-store"
    },
    {
      title: "Analytics",
      description: "Track performance",
      icon: TrendingUp,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      onClick: () => window.location.href = "/analytics",
      testId: "button-quick-analytics"
    },
    {
      title: "Settings",
      description: "Configure your store",
      icon: Settings,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => window.location.href = "/settings",
      testId: "button-quick-settings"
    },
  ];

  return (
    <>
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {actions.map((action) => (
                <Button
                  key={action.title}
                  variant="ghost"
                  className="flex items-center p-4 h-auto text-left justify-start"
                  onClick={action.onClick}
                  data-testid={action.testId}
                >
                  <div className={`w-12 h-12 ${action.iconBg} rounded-lg flex items-center justify-center mr-4`}>
                    <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload New Product</DialogTitle>
          </DialogHeader>
          <ProductForm onSuccess={handleUploadSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
