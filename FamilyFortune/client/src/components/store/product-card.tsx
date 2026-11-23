import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download } from "lucide-react";

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleBuyNow = () => {
    window.location.href = `/checkout/${product.id}`;
  };

  const handleViewProduct = () => {
    window.location.href = `/store/${product.id}`;
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
      onClick={handleViewProduct}
      data-testid={`product-card-${product.id}`}
    >
      {product.previewImageUrl ? (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={product.previewImageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            data-testid={`product-image-${product.id}`}
          />
        </div>
      ) : (
        <div className="aspect-video bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">No preview</span>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="mb-2">
          {product.category && (
            <Badge variant="secondary" className="mb-2">
              {product.category.name}
            </Badge>
          )}
          <h3 className="font-semibold text-foreground line-clamp-2 mb-1" data-testid={`product-title-${product.id}`}>
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-foreground" data-testid={`product-price-${product.id}`}>
            ${product.price}
          </span>
          <div className="flex items-center">
            <div className="flex text-yellow-400 text-xs mr-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${i < Math.floor(product.averageRating || 0) ? 'fill-current' : ''}`} 
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product._count?.reviews || 0})
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Download className="h-4 w-4 mr-1" />
            <span data-testid={`product-downloads-${product.id}`}>
              {product.downloadCount} sales
            </span>
          </div>
        </div>
        
        <Button 
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            handleBuyNow();
          }}
          data-testid={`button-buy-${product.id}`}
        >
          Buy Now
        </Button>
      </CardContent>
    </Card>
  );
}
