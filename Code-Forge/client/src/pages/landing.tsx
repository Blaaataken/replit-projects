import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  GitBranch, 
  FileCode, 
  Rocket, 
  CheckCircle2, 
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Code2,
  FolderTree,
  Github
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Describe your project in plain English and watch as AI creates a complete, production-ready repository structure.",
  },
  {
    icon: FolderTree,
    title: "Smart File Organization",
    description: "Automatically organized with industry best practices - proper folder structure, naming conventions, and modular architecture.",
  },
  {
    icon: FileCode,
    title: "Automatic README",
    description: "Get comprehensive documentation generated instantly with setup instructions, usage examples, and API references.",
  },
  {
    icon: Github,
    title: "One-Click GitHub Deploy",
    description: "Push directly to your GitHub account with a single click. Your repository is ready to clone and start coding.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Describe Your Project",
    description: "Tell us what you want to build. Choose your language, framework, and key features.",
    icon: Code2,
  },
  {
    step: "02",
    title: "AI Generates Structure",
    description: "Our AI analyzes your requirements and creates a complete file structure with boilerplate code.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Deploy to GitHub",
    description: "Review the generated repository and push it directly to your GitHub account.",
    icon: Rocket,
  },
];

const stats = [
  { value: "10K+", label: "Repositories Created" },
  { value: "5K+", label: "Developers" },
  { value: "95%", label: "Time Saved" },
  { value: "99.9%", label: "Success Rate" },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23000' stroke-width='1'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Repository Generator</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Create{" "}
              <span className="bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
                Flawless
              </span>{" "}
              Code Repositories
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Describe your project and let AI generate a complete, production-ready repository 
              with best practices, documentation, and instant GitHub deployment.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/generate">
                <Button size="lg" className="gap-2 text-base px-8" data-testid="button-hero-generate">
                  <Sparkles className="h-5 w-5" />
                  Generate Repository
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-2 text-base px-8" data-testid="button-hero-demo">
                See Example
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
              {["TypeScript", "Python", "Go", "Rust", "React", "Node.js"].map((tech) => (
                <span 
                  key={tech}
                  className="px-3 py-1.5 rounded-md bg-muted text-sm font-mono text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From idea to GitHub repository in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, index) => (
              <Card key={item.step} className="relative overflow-visible bg-card" data-testid={`card-how-it-works-${index}`}>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-5xl font-bold text-primary/20">{item.step}</span>
                    <div className="p-3 rounded-lg bg-primary/10">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to kickstart your next project
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card key={feature.title} className="hover-elevate transition-all duration-200" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 h-fit">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-6">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start generating production-ready repositories in seconds. No credit card required.
            </p>
            <Link href="/generate">
              <Button size="lg" className="gap-2 text-base px-8" data-testid="button-cta-bottom">
                <Sparkles className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">RepoGen AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with AI to help developers ship faster
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
