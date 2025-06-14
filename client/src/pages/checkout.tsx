import { useEffect, useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { completePurchase } from "@/lib/cart";
import { useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ cartItems, cartTotal, onSuccess }: any) => {
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
          return_url: window.location.origin + "/checkout/success",
        },
        redirect: "if_required",
      });

      if (error) {
        setPaymentError(error.message || "An error occurred while processing your payment.");
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded, complete the purchase
        await completePurchase(paymentIntent.id);
        
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
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

      <div className="bg-dark-lighter rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-neutral-light">Subtotal</span>
          <span className="text-white">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-light">Tax</span>
          <span className="text-white">$0.00</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-semibold">
          <span className="text-white">Total</span>
          <span className="text-white">${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${cartTotal.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

const CheckoutSuccess = () => {
  const [, navigate] = useLocation();
  
  return (
    <Card className="w-full bg-dark-card border-green-500/30">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <div>
            <CardTitle className="text-2xl font-display text-white">Payment Successful!</CardTitle>
            <CardDescription>Thank you for your purchase</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-neutral-light">
          Your payment has been processed successfully. Your mods are now available in your Mod Locker.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button className="w-full sm:w-auto" onClick={() => navigate("/mod-locker")}>
          Go to Mod Locker
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/mods")}>
          Continue Shopping
        </Button>
      </CardFooter>
    </Card>
  );
};

const CheckoutPage = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug cart state
  useEffect(() => {
    console.log("[checkout] Cart debug info:", {
      cartItems,
      cartItemsCount: cartItems?.length || 0,
      cartTotal,
      isAuthenticated
    });
  }, [cartItems, cartTotal, isAuthenticated]);

  // Check for payment success in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_intent_status') === 'succeeded') {
      setIsSuccess(true);
      clearCart();
    }
  }, [clearCart]);

  // Redirect if not authenticated
  useEffect(() => {
    // Only redirect once we've confirmed the user is not authenticated
    if (!isAuthenticated && !isLoading) {
      console.log("Checkout: User not authenticated, redirecting to auth page");
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Create PaymentIntent on page load
  useEffect(() => {
    // First check if we're authenticated
    if (!isAuthenticated) {
      console.log("Checkout: User not authenticated, waiting for auth status");
      return;
    }
    
    // Then check if cart has items
    if (cartItems.length === 0) {
      console.log("Checkout: Cart is empty, skipping payment intent creation");
      setIsLoading(false);
      return;
    }

    console.log("Checkout: Creating payment intent for cart total:", cartTotal);
    setIsLoading(true);
    setError(null);

    const createIntent = async () => {
      try {
        const res = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: cartTotal 
        });
        const data = await res.json();
        console.log("Checkout: Payment intent created successfully");
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error("Checkout: Error creating payment intent:", err);
        setError(err.message || "Failed to initialize payment. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    createIntent();
  }, [isAuthenticated, cartItems, cartTotal]);

  // Handle checkout success
  const handleCheckoutSuccess = () => {
    setIsSuccess(true);
    clearCart();
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-24 min-h-screen">
        <div className="max-w-lg mx-auto">
          <CheckoutSuccess />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card className="bg-dark-card">
              <CardContent className="flex items-center justify-center min-h-[300px]">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                  <p className="text-neutral-light">Initializing checkout...</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-dark-card border-red-500/30">
              <CardHeader>
                <CardTitle className="text-xl font-display text-white">
                  Checkout Error
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
          ) : cartItems.length === 0 ? (
            <Card className="bg-dark-card">
              <CardHeader>
                <CardTitle className="text-xl font-display text-white">
                  Your Cart is Empty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-light mb-6">
                  Add some mods to your cart before checking out.
                </p>
                <Button onClick={() => navigate("/mods")}>
                  Browse Mods
                </Button>
              </CardContent>
            </Card>
          ) : clientSecret ? (
            <Card className="bg-dark-card">
              <CardContent className="pt-6">
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                  <CheckoutForm 
                    cartItems={cartItems} 
                    cartTotal={cartTotal} 
                    onSuccess={handleCheckoutSuccess}
                  />
                </Elements>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-dark-card sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-display text-white">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Order Summary
              </CardTitle>
              <CardDescription>
                {cartItems.length} item{cartItems.length !== 1 && 's'} in your cart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length === 0 ? (
                <p className="text-neutral-light text-center py-4">
                  Your cart is empty
                </p>
              ) : (
                <>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img 
                          src={item.mod?.previewImageUrl || "/images/mod-placeholder.jpg"} 
                          alt={item.mod?.title} 
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/mod-placeholder.jpg";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{item.mod?.title}</h4>
                          <div className="flex items-center">
                            <Badge variant="outline" className="text-neutral-light text-xs">
                              {item.mod?.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-white font-medium">
                          ${(item.mod?.discountPrice || item.mod?.price || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-light">Subtotal</span>
                      <span className="text-white">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-light">Tax</span>
                      <span className="text-white">$0.00</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Total</span>
                      <span className="text-white">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
