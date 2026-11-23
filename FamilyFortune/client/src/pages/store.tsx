import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/store/product-card";
import { Search, Star, Shield, Download, Zap } from "lucide-react";

export default function Store() {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  // If viewing a specific product
  if (id) {
    if (productLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
        </div>
      );
    }

    if (!product) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
              <p className="text-muted-foreground mb-4">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => window.location.href = "/store"}>
                Browse All Products
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-vault text-primary-foreground text-sm"></i>
                </div>
                <span className="ml-2 text-xl font-bold text-foreground">DigitalVault</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/store"}
                data-testid="button-back-to-store"
              >
                ← Back to Store
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              {product.previewImageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-6">
                  <img
                    src={product.previewImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    data-testid="img-product-preview"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="title-product">
                  {product.name}
                </h1>
                {product.category && (
                  <Badge variant="secondary" className="mb-4">
                    {product.category.name}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(product.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({product._count.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Download className="h-4 w-4 mr-1" />
                  <span>{product.downloadCount} sales</span>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground" data-testid="text-price">
                  ${product.price}
                </span>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
                  {product.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => window.location.href = `/checkout/${product.id}`}
                  data-testid="button-buy-now"
                >
                  Buy Now - ${product.price}
                </Button>
                
                <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    <span>Instant Download</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    <span>Lifetime Access</span>
                  </div>
                </div>
              </div>

              {product.reviews && product.reviews.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Recent Reviews</h3>
                  <div className="space-y-4">
                    {product.reviews.slice(0, 3).map((review: any) => (
                      <Card key={review.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Store listing view
  const filteredProducts = products?.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category?.slug === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-vault text-primary-foreground text-sm"></i>
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">DigitalVault</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/"}
              data-testid="button-home"
            >
              Home
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary/90 to-secondary py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" data-testid="heading-store">
              Digital Product Store
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Discover premium digital products to grow your business and creativity
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-white/80">
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                <span>2,400+ Downloads</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span>Secure Downloads</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
              </div>
            ) : !filteredProducts || filteredProducts.length === 0 ? (
              <Card className="max-w-md mx-auto">
                <CardContent className="pt-6 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or category filter.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-vault text-primary-foreground text-sm"></i>
            </div>
            <span className="ml-2 text-xl font-bold text-foreground">DigitalVault</span>
          </div>
          <p className="text-muted-foreground">
            Secure digital marketplace for creators and buyers
          </p>
        </div>
      </footer>
    </div>
  );
}
