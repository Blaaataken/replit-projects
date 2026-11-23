import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ProductForm from "@/components/products/product-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Download, Eye } from "lucide-react";

export default function Products() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
    enabled: !!user,
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    setEditingProduct(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-foreground" data-testid="heading-products">
                Products
              </h1>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-product">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                  </DialogHeader>
                  <ProductForm 
                    product={editingProduct} 
                    onSuccess={handleCreateSuccess} 
                  />
                </DialogContent>
              </Dialog>
            </div>

            {!products || products.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No products yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start building your digital empire by adding your first product.
                  </p>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-first-product">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                      </DialogHeader>
                      <ProductForm onSuccess={handleCreateSuccess} />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <Card key={product.id} className="overflow-hidden">
                    {product.previewImageUrl && (
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={product.previewImageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          data-testid={`img-product-${product.id}`}
                        />
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg" data-testid={`title-product-${product.id}`}>
                            {product.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {product.description}
                          </CardDescription>
                        </div>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-foreground" data-testid={`price-product-${product.id}`}>
                          ${product.price}
                        </span>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Download className="h-4 w-4 mr-1" />
                          <span data-testid={`downloads-product-${product.id}`}>
                            {product.downloadCount} sales
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(product)}
                          data-testid={`button-edit-${product.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/store/${product.id}`, '_blank')}
                          data-testid={`button-view-${product.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteProductMutation.isPending}
                          data-testid={`button-delete-${product.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
