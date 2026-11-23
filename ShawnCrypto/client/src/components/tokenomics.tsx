import { Card, CardContent } from "@/components/ui/card";
import { Percent, Vote, Crown } from "lucide-react";

export default function Tokenomics() {
  const distribution = [
    { name: "Public Sale", percentage: 40, color: "bg-crypto-blue" },
    { name: "Liquidity & DEX", percentage: 25, color: "bg-crypto-purple" },
    { name: "Development", percentage: 15, color: "bg-crypto-success" },
    { name: "Marketing", percentage: 10, color: "bg-yellow-400" },
    { name: "Team & Advisors", percentage: 6, color: "bg-pink-400" },
    { name: "Reserve Fund", percentage: 4, color: "bg-orange-400" },
  ];

  const keyMetrics = [
    { label: "Total Supply", value: "1,000,000,000 SHAW", gradient: true },
    { label: "Circulating Supply", value: "650,000,000 SHAW", color: "text-crypto-blue" },
    { label: "Market Cap", value: "$12,400,000", color: "text-crypto-success" },
    { label: "Burn Rate", value: "2% / Month", color: "text-orange-400" },
  ];

  const utilityBenefits = [
    {
      icon: Percent,
      title: "Fee Discounts",
      description: "Get up to 50% discount on all platform fees when paying with SHAWNSWORKS",
      colors: "from-crypto-blue to-crypto-purple",
    },
    {
      icon: Vote,
      title: "Governance Rights",
      description: "Participate in key decisions about the future development of the ecosystem",
      colors: "from-crypto-success to-emerald-400",
    },
    {
      icon: Crown,
      title: "Premium Access",
      description: "Unlock exclusive features, early access to new products, and VIP support",
      colors: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section id="tokenomics" className="py-20 bg-crypto-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Tokenomics</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Carefully designed economics to ensure sustainable growth and maximum utility for all stakeholders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Token Distribution */}
          <Card className="glass-card">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-8 text-center">Token Distribution</h3>
              <div className="space-y-6">
                {distribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 ${item.color} rounded-full mr-3`}></div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className={`font-bold ${item.color.replace('bg-', 'text-')}`}>
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card className="glass-card">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-8 text-center">Key Metrics</h3>
              <div className="space-y-6">
                {keyMetrics.map((metric, index) => (
                  <div key={index} className="bg-crypto-darker rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">{metric.label}</div>
                    <div className={`text-2xl font-bold ${
                      metric.gradient ? 'gradient-text' : metric.color
                    }`}>
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Utility Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {utilityBenefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card key={index} className="glass-card text-center">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${benefit.colors} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="text-2xl text-white" size={32} />
                  </div>
                  <h4 className="text-xl font-bold mb-3">{benefit.title}</h4>
                  <p className="text-gray-400">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
