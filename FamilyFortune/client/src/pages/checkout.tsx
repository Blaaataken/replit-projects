import { useParams } from "wouter";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Download, Zap } from "lucide-react";

const CheckoutForm = ({ product }: { product: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/store/${product.id}?payment=success`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full" 
        size="lg"
        data-testid="button-complete-payment"
      >
        {isLoading ? "Processing..." : `Complete Payment - $${product.price}`}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { id } = useParams();
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  useEffect(() => {
    fetch('/api/stripe/publishable-key')
      .then((res) => res.json())
      .then((data) => {
        if (data.publishableKey) {
          setStripePromise(loadStripe(data.publishableKey));
        }
      })
      .catch((error) => {
        console.error("Error fetching Stripe publishable key:", error);
      });
  }, []);

  useEffect(() => {
    if (product) {
      apiRequest("POST", "/api/create-payment-intent", { productId: product.id })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Error creating payment intent:", error);
        });
    }
  }, [product]);

  if (productLoading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  if (!clientSecret || !stripePromise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-vault text-primary-foreground text-sm"></i>
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">DigitalVault</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = `/store/${product.id}`}
              data-testid="button-back-to-product"
            >
              ← Back to Product
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8 text-center" data-testid="heading-checkout">
            Complete Your Purchase
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  {product.previewImageUrl && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={product.previewImageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        data-testid="img-product-summary"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground" data-testid="title-product-summary">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    {product.category && (
                      <Badge variant="secondary" className="mt-2">
                        {product.category.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span data-testid="text-total-price">${product.price}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Secure payment with Stripe</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Download className="h-4 w-4 mr-2" />
                    <span>Instant download after payment</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 mr-2" />
                    <span>Lifetime access to your purchase</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Enter your payment information to complete the purchase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm product={product} />
                </Elements>
              </CardContent>
            </Card>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mr-2">
                <Shield className="h-3 w-3 text-white" />
              </div>
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                <i className="fab fa-stripe text-white text-xs"></i>
              </div>
              <span>Powered by Stripe</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-2">
                <Download className="h-3 w-3 text-white" />
              </div>
              <span>Instant Delivery</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
