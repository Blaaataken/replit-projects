import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Globe } from "lucide-react";
import AiCalculator from "@/components/ai-calculator";
import type { TokenMetrics } from "@shared/schema";

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery<TokenMetrics>({
    queryKey: ['/api/token-metrics'],
  });

  const supportedNetworks = [
    { name: "Ethereum", icon: "fab fa-ethereum", color: "from-blue-500 to-purple-600", status: "Active" },
    { name: "BSC", icon: "fas fa-link", color: "from-yellow-500 to-orange-600", status: "Active" },
    { name: "Polygon", icon: "fas fa-shapes", color: "from-purple-500 to-pink-600", status: "Active" },
    { name: "Avalanche", icon: "fas fa-water", color: "from-blue-400 to-cyan-500", status: "Active" },
    { name: "Fantom", icon: "fas fa-fire", color: "from-red-500 to-pink-600", status: "Active" },
    { name: "+12 More", icon: "fas fa-plus", color: "from-green-500 to-teal-600", status: "Expanding" },
  ];

  const formatPrice = (price: string) => `$${parseFloat(price).toFixed(5)}`;
  const formatLargeNumber = (num: string) => {
    const value = parseFloat(num);
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <section id="dashboard" className="py-20 bg-crypto-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Live <span className="gradient-text">Dashboard</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real-time metrics powered by our AI engine, displaying current performance across all supported networks
          </p>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="glass-card text-center hover:scale-105 transition-transform">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded mb-1"></div>
                  <div className="h-4 bg-gray-600 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold gradient-text mb-2">
                    {metrics ? formatPrice(metrics.price) : "$0.00247"}
                  </div>
                  <div className="text-crypto-success text-sm mb-1">+24.7% (24h)</div>
                  <div className="text-gray-400 text-sm">Current Price</div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="glass-card text-center hover:scale-105 transition-transform">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded mb-1"></div>
                  <div className="h-4 bg-gray-600 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-crypto-success mb-2">
                    {metrics ? formatLargeNumber(metrics.marketCap) : "$12.4M"}
                  </div>
                  <div className="text-crypto-blue text-sm mb-1">Rank #2,847</div>
                  <div className="text-gray-400 text-sm">Market Cap</div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="glass-card text-center hover:scale-105 transition-transform">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded mb-1"></div>
                  <div className="h-4 bg-gray-600 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-crypto-blue mb-2">
                    {metrics ? formatLargeNumber(metrics.volume24h) : "$847K"}
                  </div>
                  <div className="text-crypto-success text-sm mb-1">+156% (24h)</div>
                  <div className="text-gray-400 text-sm">24h Volume</div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="glass-card text-center hover:scale-105 transition-transform">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded mb-1"></div>
                  <div className="h-4 bg-gray-600 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {metrics?.holders.toLocaleString() || "18,924"}
                  </div>
                  <div className="text-crypto-success text-sm mb-1">+89 today</div>
                  <div className="text-gray-400 text-sm">Total Holders</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Value Calculator */}
        <Card className="glass-card mb-12">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">
              <Brain className="inline mr-3 text-crypto-purple" />
              AI-Driven Value Calculator
            </h3>
            <AiCalculator />
          </CardContent>
        </Card>

        {/* Multi-Chain Network Status */}
        <Card className="glass-card">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">
              <Globe className="inline mr-3 text-crypto-blue" />
              Multi-Chain Network Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {supportedNetworks.map((network, index) => (
                <div key={index} className="flex flex-col items-center p-4 bg-crypto-darker rounded-lg hover:bg-crypto-card transition-colors">
                  <div className={`w-12 h-12 bg-gradient-to-br ${network.color} rounded-full flex items-center justify-center mb-2 network-pulse`}>
                    <i className={`${network.icon} text-white`}></i>
                  </div>
                  <span className="text-sm font-medium">{network.name}</span>
                  <span className={`text-xs ${network.status === 'Active' ? 'text-crypto-success' : 'text-crypto-blue'}`}>
                    {network.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
