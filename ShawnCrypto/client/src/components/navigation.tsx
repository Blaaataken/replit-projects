import { useState } from "react";
import { Menu, X, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-crypto-dark/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-crypto-blue to-crypto-purple rounded-lg flex items-center justify-center animate-pulse-glow">
              <Coins className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold gradient-text">SHAWNSWORKS</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('dashboard')}
              className="text-gray-300 hover:text-crypto-blue transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="text-gray-300 hover:text-crypto-blue transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('tokenomics')}
              className="text-gray-300 hover:text-crypto-blue transition-colors"
            >
              Tokenomics
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gray-300 hover:text-crypto-blue transition-colors"
            >
              Contact
            </button>
            <Button className="bg-gradient-to-r from-crypto-blue to-crypto-purple hover:scale-105 transition-transform">
              Launch App
            </Button>
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-crypto-dark border-b border-gray-800 p-4 space-y-4">
            <button 
              onClick={() => scrollToSection('dashboard')}
              className="block w-full text-left text-gray-300 hover:text-crypto-blue transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="block w-full text-left text-gray-300 hover:text-crypto-blue transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('tokenomics')}
              className="block w-full text-left text-gray-300 hover:text-crypto-blue transition-colors"
            >
              Tokenomics
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left text-gray-300 hover:text-crypto-blue transition-colors"
            >
              Contact
            </button>
            <Button className="w-full bg-gradient-to-r from-crypto-blue to-crypto-purple">
              Launch App
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
