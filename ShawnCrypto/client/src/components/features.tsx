import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Sprout, RefreshCw, Bot, Palette, Gamepad2 } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: CreditCard,
      title: "Payment Gateway",
      description: "Accept SHAWNSWORKS payments on your website with our universal gateway supporting all major chains.",
      stats: {
        "Transaction Fee": "0.1%",
        "Settlement Time": "Instant",
        "Networks": "18+",
      },
      colors: "from-crypto-blue to-crypto-purple",
    },
    {
      icon: Sprout,
      title: "Staking Rewards",
      description: "Earn passive income by staking your SHAWNSWORKS tokens with our AI-optimized reward system.",
      stats: {
        "APY Range": "12-45%",
        "Lock Period": "Flexible",
        "Compound": "Auto",
      },
      colors: "from-crypto-success to-emerald-400",
    },
    {
      icon: RefreshCw,
      title: "DeFi Integration",
      description: "Seamlessly integrate with major DeFi protocols for lending, borrowing, and yield farming.",
      stats: {
        "Protocols": "25+",
        "Liquidity": "$2.1M",
        "Yield": "Up to 78%",
      },
      colors: "from-purple-500 to-pink-500",
    },
    {
      icon: Bot,
      title: "AI Trading Bot",
      description: "Let our AI trading bot optimize your portfolio and execute trades across multiple exchanges.",
      stats: {
        "Success Rate": "87.4%",
        "Exchanges": "12+",
        "Min Investment": "$100",
      },
      colors: "from-orange-500 to-red-500",
    },
    {
      icon: Palette,
      title: "NFT Marketplace",
      description: "Trade NFTs using SHAWNSWORKS with reduced fees and cross-chain compatibility.",
      stats: {
        "Trading Fee": "1.5%",
        "Collections": "500+",
        "Volume": "$890K",
      },
      colors: "from-cyan-500 to-blue-500",
    },
    {
      icon: Gamepad2,
      title: "Gaming Platform",
      description: "Use SHAWNSWORKS in our gaming ecosystem for in-game purchases and tournament prizes.",
      stats: {
        "Games": "15+",
        "Prize Pool": "$50K",
        "Players": "12,500",
      },
      colors: "from-green-500 to-teal-500",
    },
  ];

  return (
    <section id="features" className="py-20 bg-crypto-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Utility <span className="gradient-text">Features</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            SHAWNSWORKS isn't just a token—it's a complete ecosystem of financial tools and utilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="glass-card hover:scale-105 transition-transform duration-300">
                <CardContent className="p-8">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.colors} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <IconComponent className="text-3xl text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-center">{feature.title}</h3>
                  <p className="text-gray-400 text-center mb-6">
                    {feature.description}
                  </p>
                  <div className="bg-crypto-darker rounded-lg p-4">
                    <div className="text-sm text-gray-300 space-y-2">
                      {Object.entries(feature.stats).map(([key, value], statIndex) => (
                        <div key={statIndex} className="flex justify-between">
                          <span>{key}:</span>
                          <span className={`${
                            statIndex === 0 ? 'text-crypto-success' : 
                            statIndex === 1 ? 'text-crypto-blue' : 
                            'text-purple-400'
                          }`}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
