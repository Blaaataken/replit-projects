import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { useWeb3 } from "./web3-provider";
import { Wallet, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { wallet, isConnecting, connect, disconnect, currentNetwork } = useWeb3();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/trading", label: "AI Trading" },
    { path: "/bridge", label: "Bridge" },
    { path: "/staking", label: "Staking" },
  ];

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-lg px-3 py-2" data-testid="link-home">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              SW
            </div>
            <span className="hidden sm:inline font-bold text-lg">SHAWNSWORKS</span>
            <Badge variant="secondary" className="hidden md:inline">SWC</Badge>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors hover-elevate ${
                  location === link.path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                }`}
                data-testid={`link-nav-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {wallet.isConnected && currentNetwork ? (
              <Badge variant="outline" className="hidden lg:flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-status-online animate-pulse" />
                <span className="text-xs">{currentNetwork.name}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="hidden lg:flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-status-away" />
                <span className="text-xs">Not Connected</span>
              </Badge>
            )}
            <ThemeToggle />
            
            {wallet.isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="default" variant="outline" data-testid="button-wallet-menu" className="hidden sm:flex">
                    <Wallet className="h-4 w-4 mr-2" />
                    {shortenAddress(wallet.address!)}
                    <ChevronDown className="h-3 w-3 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{shortenAddress(wallet.address!)}</p>
                    <p className="text-xs text-muted-foreground">
                      {parseFloat(wallet.balance || "0").toFixed(4)} {currentNetwork?.symbol || "ETH"}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full cursor-pointer" data-testid="link-dropdown-dashboard">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={disconnect} className="text-destructive cursor-pointer" data-testid="button-disconnect">
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                size="default" 
                onClick={connect}
                disabled={isConnecting}
                data-testid="button-connect-wallet" 
                className="hidden sm:flex"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                  location === link.path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover-elevate"
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`link-mobile-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            ))}
            {wallet.isConnected ? (
              <Button 
                size="default" 
                variant="outline"
                className="w-full" 
                onClick={disconnect}
                data-testid="button-disconnect-mobile"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect ({shortenAddress(wallet.address!)})
              </Button>
            ) : (
              <Button 
                size="default" 
                className="w-full" 
                onClick={connect}
                disabled={isConnecting}
                data-testid="button-connect-wallet-mobile"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
