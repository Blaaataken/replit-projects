import { Rocket, ChartLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-crypto-darker via-crypto-dark to-crypto-darker"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-crypto-blue/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-crypto-purple/10 rounded-full blur-3xl animate-float" style={{animationDelay: '-3s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            The Future of <br />
            <span className="gradient-text">Universal Currency</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            SHAWNSWORKS is the world's first AI-driven, multi-chain cryptocurrency designed for maximum utility, 
            adaptive value, and universal accessibility across all blockchain networks.
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-crypto-blue to-crypto-purple rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-network-wired text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Multi-Chain</h3>
            <p className="text-gray-400">Seamlessly operates across Ethereum, BSC, Polygon, and 15+ other networks</p>
          </div>
          
          <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-crypto-purple to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-robot text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">AI-Driven</h3>
            <p className="text-gray-400">Intelligent algorithms optimize value and adapt to market conditions in real-time</p>
          </div>
          
          <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-crypto-success to-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-coins text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">Low Cost</h3>
            <p className="text-gray-400">Ultra-low transaction fees with high reward potential for all holders</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button className="bg-gradient-to-r from-crypto-blue to-crypto-purple px-8 py-4 text-lg font-bold hover:scale-105 transition-transform shadow-2xl">
            <Rocket className="mr-2" />
            Get SHAWNSWORKS Now
          </Button>
          <Button variant="outline" className="border-2 border-gray-600 px-8 py-4 text-lg font-bold hover:border-crypto-blue transition-colors">
            <ChartLine className="mr-2" />
            View Analytics
          </Button>
        </div>
      </div>
    </section>
  );
}
