import { useEffect, useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Clock, Lock, CheckCheck, Zap } from "lucide-react";
import { useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/subscribe/success",
        },
        redirect: "if_required",
      });

      if (error) {
        setPaymentError(error.message || "An error occurred while processing your payment.");
        toast({
          title: "Subscription Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast({
          title: "Subscription Successful",
          description: "Your subscription is now active!",
        });
        
        onSuccess();
      }
    } catch (err: any) {
      setPaymentError(err.message || "An unexpected error occurred.");
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-display font-semibold text-white">Payment Details</h3>
        <PaymentElement 
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
          }}
        />
      </div>

      {paymentError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-sm">{paymentError}</p>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full bg-secondary hover:bg-secondary-dark text-white"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Subscribe Now
          </>
        )}
      </Button>
    </form>
  );
};

const SubscriptionSuccess = () => {
  const [, navigate] = useLocation();
  
  return (
    <Card className="w-full bg-dark-card border-green-500/30">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <div>
            <CardTitle className="text-2xl font-display text-white">Subscription Activated!</CardTitle>
            <CardDescription>Welcome to premium membership</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-neutral-light">
          Your subscription has been processed successfully. You now have access to all premium mods and features.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button 
          className="w-full sm:w-auto bg-secondary hover:bg-secondary-dark text-white" 
          onClick={() => navigate("/mod-locker")}
        >
          Explore Premium Mods
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </CardFooter>
    </Card>
  );
};

const SubscribePage = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for payment success in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_intent_status') === 'succeeded') {
      setIsSuccess(true);
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/");
      toast({
        title: "Authentication Required",
        description: "Please log in to access the subscription page.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, navigate, toast]);

  // Create subscription on page load
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check if user already has a subscription
    if (user?.stripeSubscriptionId) {
      setIsSuccess(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const createSubscription = async () => {
      try {
        const res = await apiRequest("POST", "/api/get-or-create-subscription");
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || "Failed to initialize subscription. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    createSubscription();
  }, [isAuthenticated, user]);

  // Handle subscription success
  const handleSubscriptionSuccess = () => {
    setIsSuccess(true);
    refreshUser();
  };

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
        Premium <span className="text-secondary">Subscription</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card className="bg-dark-card">
              <CardContent className="flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-secondary animate-spin mb-4" />
                  <p className="text-neutral-light">Setting up your subscription...</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-dark-card border-red-500/30">
              <CardHeader>
                <CardTitle className="text-xl font-display text-white">
                  Subscription Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <AlertCircle className="text-red-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-neutral-light">{error}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : isSuccess ? (
            <SubscriptionSuccess />
          ) : clientSecret ? (
            <Card className="bg-dark-card">
              <CardContent className="pt-6">
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                  <SubscribeForm onSuccess={handleSubscriptionSuccess} />
                </Elements>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-dark-card sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-display text-white">
                <Clock className="mr-2 h-5 w-5 text-secondary" />
                Premium Benefits
              </CardTitle>
              <CardDescription>
                Unlock exclusive features and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-secondary/20 p-2 rounded-full">
                  <Lock className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-white">Exclusive Mods</h4>
                  <p className="text-neutral-light text-sm">
                    Access to all premium subscription-only mods
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-secondary/20 p-2 rounded-full">
                  <Zap className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-white">Early Access</h4>
                  <p className="text-neutral-light text-sm">
                    Get new mods before they're publicly available
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-secondary/20 p-2 rounded-full">
                  <CheckCheck className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-white">Priority Support</h4>
                  <p className="text-neutral-light text-sm">
                    Dedicated support channel for subscribers
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-display font-bold text-white">$9.99</span>
                    <span className="text-neutral-light ml-1">/month</span>
                  </div>
                  <Badge className="bg-secondary text-white">Best Value</Badge>
                </div>
                
                <ul className="text-sm space-y-2">
                  <li className="flex items-center text-neutral-light">
                    <CheckCircle className="h-4 w-4 text-secondary mr-2" /> Cancel anytime
                  </li>
                  <li className="flex items-center text-neutral-light">
                    <CheckCircle className="h-4 w-4 text-secondary mr-2" /> Auto-renewing subscription
                  </li>
                  <li className="flex items-center text-neutral-light">
                    <CheckCircle className="h-4 w-4 text-secondary mr-2" /> Supports mod development
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscribePage;
