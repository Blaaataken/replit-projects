import { AliceAvatar } from "@/components/alice-avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageSquare, Target, Lightbulb, Sparkles } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Intelligent Conversations",
    description: "Engage in natural, context-aware conversations that remember your history and preferences.",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set, track, and achieve your goals with personalized guidance and progress monitoring.",
  },
  {
    icon: Lightbulb,
    title: "Proactive Suggestions",
    description: "Receive timely, relevant suggestions that anticipate your needs and help you stay on track.",
  },
  {
    icon: Sparkles,
    title: "Learns & Grows",
    description: "Alice evolves with you, learning your patterns and adapting to your unique communication style.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AliceAvatar size="sm" />
            <span className="font-semibold text-lg">Alice</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <AliceAvatar size="lg" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Meet Alice
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              An intuitive AI personal assistant that learns and grows with you. 
              Set goals, track progress, and get proactive suggestions tailored to your unique needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/api/login">Get Started</a>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Your Personal AI Companion
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Alice combines advanced AI with a personal touch, creating an assistant that truly understands you.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-lg bg-card border border-card-border"
                >
                  <div className="w-12 h-12 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Meet Alice?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your journey with an AI assistant that puts your goals first and grows alongside you.
            </p>
            <Button size="lg" asChild data-testid="button-cta-start">
              <a href="/api/login">Start Chatting with Alice</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>Created: October 18, 1981 | Reimagined for the modern era</p>
        </div>
      </footer>
    </div>
  );
}
