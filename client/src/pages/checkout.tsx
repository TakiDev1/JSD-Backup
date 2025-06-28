import { useEffect, useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, ShoppingCart, CreditCard, CheckCircle, AlertCircle, Lock, 
  ArrowLeft, Shield, Star, Sparkles, Crown, Download, Zap, Timer, Gift 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { CheckoutProgress } from "@/components/shared/checkout-progress";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CartItem {
  id: number;
  userId: number;
  modId: number;
  addedAt: string;
  mod: {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPrice: number | null;
    previewImageUrl: string;
    category: string;
    tags: string[];
    features: string[];
    isSubscriptionOnly: boolean;
  };
}

const checkoutSteps = [
  {
    id: 1,
    title: "Review Cart",
    description: "Verify your selected mods",
    icon: ShoppingCart,
    points: 10
  },
  {
    id: 2,
    title: "Payment Info",
    description: "Enter secure payment details",
    icon: CreditCard,
    points: 15
  },
  {
    id: 3,
    title: "Complete",
    description: "Download and enjoy your mods",
    icon: Download,
    points: 25
  }
];

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
          return_url: window.location.origin + "/checkout?success=true",
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
        // Payment succeeded
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
        <h3 className="text-lg font-semibold text-white">Payment Details</h3>
        <div className="p-4 border border-purple-900/30 rounded-lg bg-black/20">
          <PaymentElement 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
            }}
          />
        </div>
      </div>

      {paymentError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-red-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-sm">{paymentError}</p>
        </div>
      )}

      <div className="bg-black/30 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-300">Subtotal</span>
          <span className="text-white">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">Tax</span>
          <span className="text-white">$0.00</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-semibold">
          <span className="text-white">Total</span>
          <span className="text-white">${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl text-lg transition-all duration-300"
          disabled={!stripe || isProcessing}
          size="lg"
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                />
                Processing Payment...
              </motion.div>
            ) : (
              <motion.div
                key="payment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Pay ${cartTotal.toFixed(2)}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </form>
  );
};

const CheckoutSuccess = () => {
  const [, navigate] = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-900/20 to-black flex items-center justify-center relative overflow-hidden">
      {/* Success background animation */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-40 h-40 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="relative z-10 max-w-md w-full mx-4"
      >
        <Card className="bg-black/50 backdrop-blur-lg border-green-900/30">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Payment Successful!
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-4 mb-8"
            >
              <p className="text-slate-300 text-lg">
                Your mods are now available in your library. Enjoy!
              </p>
              
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center text-green-400">
                  <Crown className="h-4 w-4 mr-1" />
                  <span>+50 Points Earned</span>
                </div>
                <div className="flex items-center text-yellow-400">
                  <Star className="h-4 w-4 mr-1" />
                  <span>Checkout Master</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all duration-300" 
                onClick={() => navigate("/mod-locker")}
              >
                <Download className="mr-2 h-5 w-5" />
                View My Mods
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-green-600/50 text-green-400 hover:bg-green-600/20 hover:border-green-600 transition-all duration-300" 
                onClick={() => navigate("/mods")}
              >
                Continue Shopping
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const CheckoutPage = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userPoints] = useState(245); // Mock user points
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart items query
  const {
    data: cartItems = [],
    isLoading: cartLoading
  } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      const response = await fetch('/api/cart', { 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 401) return [];
      if (!response.ok) throw new Error('Failed to fetch cart items');
      
      return await response.json();
    },
    enabled: isAuthenticated
  });

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.mod?.discountPrice ?? item.mod?.price ?? 0;
    return sum + price;
  }, 0);

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });

  // Check for payment success in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setIsSuccess(true);
      clearCartMutation.mutate();
    }
  }, []);

  // Create PaymentIntent on page load
  useEffect(() => {
    if (!isAuthenticated || cartItems.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const createIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount: cartTotal 
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || "Failed to initialize payment. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    createIntent();
  }, [isAuthenticated, cartItems, cartTotal]);

  // Step progression
  useEffect(() => {
    if (cartItems.length > 0 && !completedSteps.includes(1)) {
      setCompletedSteps([1]);
      setCurrentStep(2);
    }
  }, [cartItems, completedSteps]);

  // Handle checkout success
  const handleCheckoutSuccess = () => {
    setCompletedSteps(prev => [...prev, 2, 3]);
    setCurrentStep(3);
    setIsSuccess(true);
    clearCartMutation.mutate();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-40 h-40 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Card className="w-full max-w-md bg-black/50 backdrop-blur-lg border-purple-900/30">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              >
                <Lock className="h-16 w-16 text-purple-400 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">Please Sign In</h2>
              <p className="text-slate-300 mb-6">
                You need to be signed in to complete your purchase.
              </p>
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-bold py-3 rounded-xl transition-all duration-300">
                  <Zap className="mr-2 h-5 w-5" />
                  Sign In Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-40 h-40 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Card className="w-full max-w-md bg-black/50 backdrop-blur-lg border-purple-900/30">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              >
                <CreditCard className="h-16 w-16 text-purple-400 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">Cart is Empty</h2>
              <p className="text-slate-300 mb-6">
                Add some amazing mods to your cart before checking out.
              </p>
              <Link href="/mods">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-bold py-3 rounded-xl transition-all duration-300">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Browse Mods
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return <CheckoutSuccess />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/cart" className="inline-flex items-center text-slate-300 hover:text-white transition-colors group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Cart
          </Link>
          
          <div className="text-right">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              Secure Checkout
            </h1>
            <div className="flex items-center text-sm text-slate-400 mt-1">
              <Shield className="h-4 w-4 mr-2 text-green-400" />
              SSL Encrypted
            </div>
          </div>
        </motion.div>

        {/* Progress stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <CheckoutProgress
            currentStep={currentStep}
            totalSteps={3}
            steps={checkoutSteps}
            completedSteps={completedSteps}
            userPoints={userPoints}
          />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-black/50 backdrop-blur-lg border-purple-900/30 hover:border-purple-600/50 transition-all duration-500">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <CreditCard className="h-6 w-6 mr-3 text-purple-400" />
                  <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">Payment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full mb-4"
                      />
                      <p className="text-slate-300">Initializing secure payment...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <AlertCircle className="text-red-500 h-5 w-5 mt-0.5" />
                      <div>
                        <h3 className="text-red-400 font-semibold mb-2">Payment Error</h3>
                        <p className="text-red-300 text-sm">{error}</p>
                        <Button
                          variant="outline"
                          className="mt-4 border-red-500/50 text-red-400 hover:bg-red-500/20"
                          onClick={() => window.location.reload()}
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={{ 
                    clientSecret, 
                    appearance: { 
                      theme: 'night',
                      variables: {
                        colorBackground: 'rgba(0, 0, 0, 0.3)',
                        colorText: '#ffffff',
                        colorPrimary: '#8b5cf6',
                        borderRadius: '8px'
                      }
                    } 
                  }}>
                    <CheckoutForm 
                      cartItems={cartItems} 
                      cartTotal={cartTotal} 
                      onSuccess={handleCheckoutSuccess}
                    />
                  </Elements>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400">Unable to initialize payment form</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-black/50 backdrop-blur-lg border-green-900/30 hover:border-green-600/50 transition-all duration-500 sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">Order Summary</CardTitle>
                <div className="flex items-center text-sm text-slate-400">
                  <Gift className="h-4 w-4 mr-2 text-yellow-400" />
                  Instant download after payment
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-black/30 to-purple-900/10 border border-purple-900/20 order-summary-item"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.mod.previewImageUrl || "/images/mod-placeholder.jpg"}
                          alt={item.mod.title}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-semibold text-white line-clamp-1">{item.mod.title}</h4>
                          <Badge className="bg-gradient-to-r from-green-600/20 to-purple-600/20 text-green-300 border-green-600/30 text-xs mt-1">
                            {item.mod.category}
                          </Badge>
                        </div>
                      </div>
                      <span className="font-bold text-green-400 text-lg">
                        ${item.mod.discountPrice || item.mod.price}
                      </span>
                    </motion.div>
                  ))}
                </div>
                
                <div className="h-px bg-gradient-to-r from-purple-600/30 to-green-600/30"></div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-300">Subtotal</span>
                    <span className="font-semibold text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Processing Fee</span>
                    <span>FREE</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-purple-600/30 to-green-600/30"></div>
                  <div className="flex justify-between font-bold text-xl">
                    <span className="text-white">Total</span>
                    <span className="bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-900/20 to-purple-900/20 p-4 rounded-lg border border-green-900/30">
                  <div className="flex items-center text-sm text-green-300">
                    <Star className="h-4 w-4 mr-2" />
                    <span>Earn 50 points with this purchase</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
