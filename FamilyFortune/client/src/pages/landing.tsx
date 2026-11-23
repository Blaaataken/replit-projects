import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Download, Star, TrendingUp, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-vault text-primary-foreground text-sm"></i>
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">DigitalVault</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/store"}
                data-testid="button-browse-store"
              >
                Browse Store
              </Button>
              <Button 
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-white/20 text-white border-white/30" data-testid="badge-marketplace">
              Digital Marketplace
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Sell Digital Products & 
              <span className="text-yellow-300"> Build Your Income</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Create a sustainable income stream by selling courses, templates, ebooks, and digital assets to customers worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-start-selling"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Start Selling Today
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-3"
                onClick={() => window.location.href = "/store"}
                data-testid="button-explore-products"
              >
                Explore Products
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/80">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                <span>Instant Delivery</span>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                <span>Quality Products</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and features you need to build a thriving digital business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Easy Product Upload</CardTitle>
                <CardDescription>
                  Upload your digital products with drag-and-drop simplicity. Support for all file types.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Powered by Stripe for secure, reliable payment processing with instant payouts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Automated Delivery</CardTitle>
                <CardDescription>
                  Customers receive instant download links after purchase. No manual work required.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>
                  Track customers, manage orders, and build relationships with your buyers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Monitor sales, revenue, and performance with detailed analytics and reporting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Review System</CardTitle>
                <CardDescription>
                  Build trust with customer reviews and ratings for your digital products.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Build Sustainable Income for Your Family
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Create multiple revenue streams by selling your expertise and creativity. 
                Our platform helps you reach customers worldwide and build a business that supports your family's needs.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Passive Income</h3>
                    <p className="text-muted-foreground">Earn money while you sleep with automated digital sales</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Global Reach</h3>
                    <p className="text-muted-foreground">Sell to customers around the world, 24/7</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">No Inventory</h3>
                    <p className="text-muted-foreground">Digital products mean no shipping, storage, or inventory costs</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Scale Unlimited</h3>
                    <p className="text-muted-foreground">Sell the same product to unlimited customers</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:pl-8">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-2xl">Ready to Start?</CardTitle>
                  <CardDescription className="text-lg">
                    Join thousands of creators building sustainable income with digital products.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Setup Fee</span>
                      <span className="font-semibold">Free</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Monthly Fee</span>
                      <span className="font-semibold">Free</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Transaction Fee</span>
                      <span className="font-semibold">Stripe Standard</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => window.location.href = "/api/login"}
                    data-testid="button-create-account"
                  >
                    Create Your Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-vault text-primary-foreground text-sm"></i>
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">DigitalVault</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Build your digital empire. Start selling today.
            </p>
            <div className="flex items-center justify-center space-x-6 text-muted-foreground">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                <span className="text-sm">Secure</span>
              </div>
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-1" />
                <span className="text-sm">Instant</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1" />
                <span className="text-sm">Trusted</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
