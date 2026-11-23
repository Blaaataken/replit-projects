import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SiGithub, SiX, SiDiscord, SiTelegram } from "react-icons/si";

export function Footer() {
  return (
    <footer className="w-full border-t bg-card mt-24">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                SW
              </div>
              <span className="font-bold text-lg">SHAWNSWORKS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Revolutionary multi-chain cryptocurrency platform with AI-powered trading and intelligent optimization.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" data-testid="link-social-twitter">
                <SiX className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-social-discord">
                <SiDiscord className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-social-telegram">
                <SiTelegram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-social-github">
                <SiGithub className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-dashboard">Dashboard</Link></li>
              <li><Link href="/trading" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-trading">AI Trading</Link></li>
              <li><Link href="/bridge" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-bridge">Cross-Chain Bridge</Link></li>
              <li><Link href="/staking" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-staking">Staking</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-docs">Documentation</Link></li>
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-api">API Reference</Link></li>
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-whitepaper">Whitepaper</Link></li>
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-security">Security Audit</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest updates on new features and network integrations.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="your@email.com" 
                className="h-10"
                data-testid="input-newsletter-email"
              />
              <Button size="default" data-testid="button-newsletter-subscribe">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 SHAWNSWORKS. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms</Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy</Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
