import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PayPalButton from "@/components/paypal-button";
import { 
  Check, 
  Zap, 
  Crown, 
  CreditCard,
  Loader2,
  Sparkles,
  Gift
} from "lucide-react";
import { SiPaypal } from "react-icons/si";

interface UsageData {
  freeGenerationsUsed: number;
  freeGenerationsLimit: number;
  paidGenerationsRemaining: number;
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
  canGenerate: boolean;
  reason?: string;
}

interface StripeConfig {
  publishableKey: string;
}

function StripeCheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/pricing?payment=success",
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else if (paymentIntent?.status === "succeeded") {
      try {
        const confirmRes = await apiRequest("POST", "/api/stripe/confirm-payment", {
          paymentIntentId: paymentIntent.id,
        });
        const confirmData = await confirmRes.json();
        if (confirmData.success) {
          toast({
            title: "Payment successful!",
            description: "Your generation credit has been added.",
          });
          queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
          onSuccess();
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Payment received but credit not added. Please contact support.",
          variant: "destructive",
        });
      }
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full" 
        data-testid="button-stripe-pay"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay $3.00
          </>
        )}
      </Button>
    </form>
  );
}

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showStripeDialog, setShowStripeDialog] = useState(false);
  const [showPayPalDialog, setShowPayPalDialog] = useState(false);

  const { data: usage } = useQuery<UsageData>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });

  const { data: stripeConfig } = useQuery<StripeConfig>({
    queryKey: ["/api/stripe/config"],
  });

  useEffect(() => {
    if (stripeConfig?.publishableKey && !stripePromise) {
      setStripePromise(loadStripe(stripeConfig.publishableKey));
    }
  }, [stripeConfig]);

  const handlePayPerBuild = async () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    try {
      const res = await apiRequest("POST", "/api/stripe/create-payment-intent", {});
      const data = await res.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowStripeDialog(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    setShowPayPalDialog(true);
  };

  const handlePayPalSuccess = async (data: any) => {
    try {
      const res = await apiRequest("POST", "/api/paypal/confirm-subscription", {
        orderId: data.id,
        subscriptionType: "monthly",
      });
      const result = await res.json();
      if (result.success) {
        toast({
          title: "Subscription activated!",
          description: "You now have unlimited generations for the month.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
        setShowPayPalDialog(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate subscription. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const freeTrialRemaining = usage ? Math.max(0, 1 - (usage.freeGenerationsUsed || 0)) : 1;
  const hasActiveSubscription = usage?.subscriptionStatus === "active";

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          Pricing
        </Badge>
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Start with a free generation to see the magic, then pay as you go or subscribe for unlimited access.
        </p>
      </div>

      {isAuthenticated && usage && (
        <Card className="max-w-md mx-auto mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Your Usage</p>
                {hasActiveSubscription ? (
                  <p className="font-semibold text-green-600">Unlimited (Subscribed)</p>
                ) : (
                  <p className="font-semibold">
                    {freeTrialRemaining > 0 ? `${freeTrialRemaining} free trial remaining` : 
                     (usage.paidGenerationsRemaining || 0) > 0 ? `${usage.paidGenerationsRemaining} paid generations` : 
                     "No generations remaining"}
                  </p>
                )}
              </div>
              {hasActiveSubscription && (
                <Badge variant="default" className="bg-green-600">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-green-600" />
              <Badge variant="secondary">Free Trial</Badge>
            </div>
            <CardTitle className="text-2xl">Try It Out</CardTitle>
            <CardDescription>
              One free repository generation to see how it works
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">$0</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>1 free generation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Full repository structure</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>GitHub deployment</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              disabled={freeTrialRemaining <= 0}
              onClick={() => window.location.href = "/generate"}
              data-testid="button-free-trial"
            >
              {freeTrialRemaining > 0 ? "Start Free Trial" : "Trial Used"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative border-primary">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary">Most Popular</Badge>
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">Pay Per Build</CardTitle>
            <CardDescription>
              Pay only when you need to generate a repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              $3<span className="text-lg font-normal text-muted-foreground">/build</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>1 repository generation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Production-ready code</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>All languages supported</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>One-click GitHub deploy</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handlePayPerBuild}
              data-testid="button-pay-per-build"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Buy 1 Generation
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Pro Monthly</CardTitle>
            <CardDescription>
              Unlimited generations for power users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              $15<span className="text-lg font-normal text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Unlimited generations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>All features included</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Cancel anytime</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant={hasActiveSubscription ? "outline" : "default"}
              className="w-full" 
              onClick={handleSubscribe}
              disabled={hasActiveSubscription}
              data-testid="button-subscribe"
            >
              <SiPaypal className="mr-2 h-4 w-4" />
              {hasActiveSubscription ? "Already Subscribed" : "Subscribe with PayPal"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showStripeDialog} onOpenChange={setShowStripeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Pay $3.00 for one repository generation
            </DialogDescription>
          </DialogHeader>
          
          {stripePromise && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeCheckoutForm 
                onSuccess={() => {
                  setShowStripeDialog(false);
                  setClientSecret(null);
                }} 
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showPayPalDialog} onOpenChange={setShowPayPalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe with PayPal</DialogTitle>
            <DialogDescription>
              Subscribe for $15/month for unlimited generations
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <PayPalButton 
              amount="15.00" 
              currency="USD" 
              intent="CAPTURE"
              onSuccess={handlePayPalSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
