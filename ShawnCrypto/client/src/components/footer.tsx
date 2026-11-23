import { Coins } from "lucide-react";

export default function Footer() {
  const quickLinks = [
    { name: "Dashboard", href: "#dashboard" },
    { name: "Features", href: "#features" },
    { name: "Tokenomics", href: "#tokenomics" },
    { name: "Contact", href: "#contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Whitepaper", href: "#" },
    { name: "Audit Report", href: "#" },
  ];

  const socialLinks = [
    { icon: "fab fa-twitter", href: "#", color: "hover:bg-crypto-blue" },
    { icon: "fab fa-telegram", href: "#", color: "hover:bg-crypto-purple" },
    { icon: "fab fa-discord", href: "#", color: "hover:bg-crypto-success" },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-crypto-dark border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-crypto-blue to-crypto-purple rounded-lg flex items-center justify-center">
                <Coins className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold gradient-text">SHAWNSWORKS</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The world's first AI-driven, multi-chain cryptocurrency designed for maximum utility and universal accessibility.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`w-10 h-10 bg-crypto-card rounded-lg flex items-center justify-center ${social.color} transition-colors`}
                >
                  <i className={`${social.icon} text-white`}></i>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-crypto-blue transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-crypto-blue transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 SHAWNSWORKS. All rights reserved. Not investment advice. Cryptocurrency investments carry risk.
          </p>
        </div>
      </div>
    </footer>
  );
}
