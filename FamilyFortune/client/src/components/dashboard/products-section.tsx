import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductForm from "@/components/products/product-form";
import { Plus, Download, Edit, Eye } from "lucide-react";

interface ProductsSectionProps {
  products: any[];
  isLoading: boolean;
}

export default function ProductsSection({ products, isLoading }: ProductsSectionProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse border border-border rounded-lg overflow-hidden">
                <div className="w-full h-32 bg-muted"></div>
                <div className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="h-3 bg-muted rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedProducts = products.slice(0, 4);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Products</CardTitle>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-add-product-section">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {displayedProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No products yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first digital product
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-product-section">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Product
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {displayedProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                    data-testid={`product-card-${product.id}`}
                  >
                    {product.previewImageUrl ? (
                      <img
                        src={product.previewImageUrl}
                        alt={product.name}
                        className="w-full h-32 object-cover"
                        data-testid={`product-image-${product.id}`}
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No preview</span>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground line-clamp-1" data-testid={`product-name-${product.id}`}>
                          {product.name}
                        </h3>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-foreground" data-testid={`product-price-${product.id}`}>
                          ${product.price}
                        </span>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Download className="h-4 w-4 mr-1" />
                          <span data-testid={`product-sales-${product.id}`}>
                            {product.downloadCount} sales
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.location.href = `/products`}
                          data-testid={`button-edit-product-${product.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/store/${product.id}`, '_blank')}
                          data-testid={`button-view-product-${product.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {products.length > 4 && (
                <div className="text-center mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/products'}
                    data-testid="button-view-all-products"
                  >
                    View All Products ({products.length})
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
