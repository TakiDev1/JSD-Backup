import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
}

function CheckoutForm({ clientSecret, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin, // Fallback
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          "Complete Purchase"
        )}
      </Button>
    </form>
  );
}

const SubscriptionOptions = ({ onSelectPlan }: { onSelectPlan: (duration: string) => void }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>1 Month</CardTitle>
          <CardDescription>Basic access</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">$5.99</p>
          <ul className="mt-4 space-y-2">
            <li>✓ Access to all premium mods</li>
            <li>✓ New releases during subscription</li>
            <li>✓ Discord role</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={() => onSelectPlan('1month')} className="w-full">Select Plan</Button>
        </CardFooter>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>3 Months</CardTitle>
          <CardDescription>Popular choice</CardDescription>
          <Badge className="absolute top-2 right-2 bg-blue-500">20% OFF</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">$14.99</p>
          <p className="text-sm text-muted-foreground line-through">$17.97</p>
          <ul className="mt-4 space-y-2">
            <li>✓ Access to all premium mods</li>
            <li>✓ New releases during subscription</li>
            <li>✓ Discord role</li>
            <li>✓ Early access to beta releases</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={() => onSelectPlan('3month')} className="w-full">Select Plan</Button>
        </CardFooter>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow border-blue-500">
        <CardHeader className="bg-blue-50 dark:bg-blue-950 rounded-t-lg">
          <CardTitle>6 Months</CardTitle>
          <CardDescription>Best value</CardDescription>
          <Badge className="absolute top-2 right-2 bg-green-500">30% OFF</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">$24.99</p>
          <p className="text-sm text-muted-foreground line-through">$35.94</p>
          <ul className="mt-4 space-y-2">
            <li>✓ Access to all premium mods</li>
            <li>✓ New releases during subscription</li>
            <li>✓ Discord role</li>
            <li>✓ Early access to beta releases</li>
            <li>✓ Vote on upcoming mods</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={() => onSelectPlan('6month')} className="w-full">Select Plan</Button>
        </CardFooter>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>12 Months</CardTitle>
          <CardDescription>Biggest savings</CardDescription>
          <Badge className="absolute top-2 right-2 bg-purple-500">45% OFF</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">$39.99</p>
          <p className="text-sm text-muted-foreground line-through">$71.88</p>
          <ul className="mt-4 space-y-2">
            <li>✓ Access to all premium mods</li>
            <li>✓ New releases during subscription</li>
            <li>✓ Discord role</li>
            <li>✓ Early access to beta releases</li>
            <li>✓ Vote on upcoming mods</li>
            <li>✓ Priority support</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={() => onSelectPlan('12month')} className="w-full">Select Plan</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { user, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSubscriptionMutation = useMutation({
    mutationFn: async (duration: string) => {
      const res = await apiRequest("POST", "/api/purchase-subscription", { duration });
      return res.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activateSubscriptionMutation = useMutation({
    mutationFn: async (paymentIntentId: string) => {
      const res = await apiRequest("POST", "/api/activate-subscription", { paymentIntentId });
      return res.json();
    },
    onSuccess: (_data) => {
      toast({
        title: "Success!",
        description: "Your subscription has been activated.",
      });
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/mod-locker");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (duration: string) => {
    setSelectedPlan(duration);
    createSubscriptionMutation.mutate(duration);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    activateSubscriptionMutation.mutate(paymentIntentId);
  };

  // Check if user already has an active premium subscription
  const now = new Date();
  const premiumExpiresAt = user?.premiumExpiresAt ? new Date(user.premiumExpiresAt) : null;
  const isPremiumActive = user?.isPremium && premiumExpiresAt && premiumExpiresAt > now;

  if (isPremiumActive) {
    return (
      <div className="container max-w-6xl py-12">
        <h1 className="text-3xl font-bold mb-8">Your JSD Mods Subscription</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Subscription</CardTitle>
            <CardDescription>Your subscription is currently active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>You have full access to all premium mods until:</p>
              <p className="text-2xl font-bold">{premiumExpiresAt?.toLocaleDateString()}</p>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Your Benefits:</h3>
                <ul className="space-y-1">
                  <li>✓ Access to all premium mods</li>
                  <li>✓ New releases during subscription</li>
                  <li>✓ Discord role</li>
                  <li>✓ Early access to new content</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation("/mod-locker")}>View Your Mod Locker</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-12">
      <h1 className="text-3xl font-bold mb-2">JSD Mods Subscription</h1>
      <p className="text-muted-foreground mb-8">Get access to all premium mods with a subscription</p>
      
      {!selectedPlan && (
        <SubscriptionOptions onSelectPlan={handleSelectPlan} />
      )}

      {createSubscriptionMutation.isPending && (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {selectedPlan && clientSecret && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Complete Your Subscription</h2>
            <Button variant="outline" onClick={() => {
              setSelectedPlan(null);
              setClientSecret(null);
            }}>
              Change Plan
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Your subscription will begin immediately upon payment</CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                  clientSecret={clientSecret} 
                  onSuccess={handlePaymentSuccess} 
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}