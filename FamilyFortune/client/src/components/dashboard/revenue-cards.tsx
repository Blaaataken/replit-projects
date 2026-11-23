import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, Download } from "lucide-react";

interface RevenueCardsProps {
  analytics?: {
    totalRevenue: number;
    totalSales: number;
    productCount: number;
    downloadCount: number;
  };
  isLoading: boolean;
}

export default function RevenueCards({ analytics, isLoading }: RevenueCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Revenue",
      value: `$${analytics?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      className: "bg-gradient-to-br from-accent to-green-600 text-white",
      testId: "card-total-revenue"
    },
    {
      title: "Total Sales",
      value: analytics?.totalSales?.toString() || '0',
      icon: ShoppingBag,
      className: "bg-card border border-border",
      iconClassName: "text-primary",
      testId: "card-total-sales"
    },
    {
      title: "Products",
      value: analytics?.productCount?.toString() || '0',
      icon: Package,
      className: "bg-card border border-border",
      iconClassName: "text-secondary",
      testId: "card-products"
    },
    {
      title: "Downloads",
      value: analytics?.downloadCount?.toString() || '0',
      icon: Download,
      className: "bg-card border border-border",
      iconClassName: "text-accent",
      testId: "card-downloads"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <Card key={card.title} className={card.className} data-testid={card.testId}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <card.icon className={`h-6 w-6 ${card.iconClassName || ''}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium ${card.className.includes('text-white') ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {card.title}
                  </dt>
                  <dd className={`text-lg font-bold ${card.className.includes('text-white') ? 'text-white' : 'text-foreground'}`} data-testid={`value-${card.testId}`}>
                    {card.value}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
