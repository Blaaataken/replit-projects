import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Zap, Shield, TrendingUp, Network, Brain, Lock } from "lucide-react";
import { SiEthereum, SiBinance, SiPolygon } from "react-icons/si";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        
        <div className="container relative z-10 mx-auto px-4 lg:px-8 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="mb-4" data-testid="badge-hero-label">
              <Zap className="h-3 w-3 mr-1" />
              Next-Generation Multi-Chain Platform
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight" data-testid="text-hero-title">
              SHAWNSWORKS
              <span className="block text-primary mt-2">Multi-Chain AI Utility</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-description">
              Revolutionary cryptocurrency platform bridging all major networks with AI-powered trading, 
              intelligent gas optimization, and automated staking rewards.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="text-base" data-testid="button-launch-app">
                  Launch App
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base" data-testid="button-view-docs">
                View Documentation
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 pt-12 flex-wrap">
              <div className="flex items-center gap-2">
                <SiEthereum className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Ethereum</span>
              </div>
              <div className="flex items-center gap-2">
                <SiBinance className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">BSC</span>
              </div>
              <div className="flex items-center gap-2">
                <SiPolygon className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Polygon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4" data-testid="text-features-title">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for next-generation decentralized finance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-elevate transition-all" data-testid="card-feature-ai-trading">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI-Powered Trading</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Advanced machine learning algorithms analyze market trends and execute optimal trades automatically.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all" data-testid="card-feature-cross-chain">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Network className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Cross-Chain Bridge</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Seamlessly transfer assets across multiple blockchain networks with lowest fees and fastest speeds.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all" data-testid="card-feature-gas-optimization">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Gas Optimization</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  AI routes transactions through the most cost-effective networks, saving you up to 90% on fees.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all" data-testid="card-feature-staking">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Smart Staking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Automated yield optimization across multiple networks maximizes your staking rewards.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all" data-testid="card-feature-security">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Bank-Grade Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Multi-signature wallets and advanced encryption protect your assets at all times.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all" data-testid="card-feature-privacy">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Privacy First</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Zero-knowledge proofs ensure your transactions remain completely private and untraceable.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-12">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-semibold" data-testid="text-cta-title">
                  Ready to Experience the Future?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join thousands of traders using SHAWNSWORKS to maximize their crypto portfolio
                </p>
                <Link href="/dashboard">
                  <Button size="lg" className="text-base" data-testid="button-get-started">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
