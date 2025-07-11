import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ShoppingCart, Trash2, ArrowLeft, Star, Heart, Zap, Sparkles, Gift, Timer, TrendingUp, Shield, Crown, Target } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from 'react';
import { FloatingDealNotification } from "@/components/shared/sales-banner";

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

interface Deal {
  id: string;
  type: 'bundle' | 'discount' | 'freebie' | 'upgrade';
  title: string;
  description: string;
  discount: number;
  threshold?: number;
  requiredItems?: string[];
  icon: any;
  color: string;
  active: boolean;
}

export default function CartPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [showUpsells, setShowUpsells] = useState(false);
  const [showFloatingDeal, setShowFloatingDeal] = useState(false);

  // Cart items query
  const {
    data: items = [],
    isLoading,
    error
  } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      const response = await fetch('/api/cart', { 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 401) return [];
      if (!response.ok) throw new Error('Failed to fetch cart items');
      
      const data = await response.json();
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Recommended products query
  const { data: recommendedMods } = useQuery({
    queryKey: ["/api/mods", { featured: true, limit: 6 }],
    queryFn: ({ queryKey }) => {
      const [url, params] = queryKey as [string, { featured: boolean; limit: number }];
      const searchParams = new URLSearchParams();
      if (params.featured) searchParams.set('featured', 'true');
      if (params.limit) searchParams.set('limit', params.limit.toString());
      return fetch(`${url}?${searchParams}`).then(res => res.json());
    }
  });

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show upsells after a delay
  useEffect(() => {
    const timer = setTimeout(() => setShowUpsells(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const removeItemMutation = useMutation({
    mutationFn: async (modId: number) => {
      const response = await fetch(`/api/cart/${modId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to remove item from cart');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const addToCartMutation = useMutation({
    mutationFn: async (modId: number) => {
      const response = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modId })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to add item to cart');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    }
  });

  const total = items.reduce((sum, item) => {
    const price = item.mod?.discountPrice ?? item.mod?.price ?? 0;
    return sum + price;
  }, 0);

  const count = items.length;
  const savings = items.reduce((sum, item) => {
    if (item.mod?.discountPrice) {
      return sum + (item.mod.price - item.mod.discountPrice);
    }
    return sum;
  }, 0);

  // Show floating deals less frequently in cart
  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        if (Math.random() > 0.6) { // Only 40% chance to show
          setShowFloatingDeal(true);
        }
      }, 30000); // Wait 30 seconds instead of 8
      return () => clearTimeout(timer);
    }
  }, [count]);

  // Smart deals based on cart content
  const deals: Deal[] = [
    {
      id: 'bundle',
      type: 'bundle',
      title: 'Drift Master Bundle',
      description: 'Add 2 more drift cars and save 25%',
      discount: 25,
      threshold: 3,
      requiredItems: ['drift'],
      icon: Target,
      color: 'from-purple-600 to-pink-600',
      active: items.some(item => item.mod.category === 'drift') && count < 3
    },
    {
      id: 'spend_more',
      type: 'discount',
      title: 'Spend $50, Save 15%',
      description: `Add $${(50 - total).toFixed(2)} more to unlock this deal`,
      discount: 15,
      threshold: 50,
      icon: Gift,
      color: 'from-green-600 to-emerald-600',
      active: total > 30 && total < 50
    },
    {
      id: 'premium',
      type: 'upgrade',
      title: 'Premium Member Perks',
      description: 'Unlock exclusive mods and early access',
      discount: 20,
      icon: Crown,
      color: 'from-yellow-600 to-orange-600',
      active: !user?.stripeSubscriptionId && total > 25
    },
    {
      id: 'limited_time',
      type: 'freebie',
      title: 'Limited Time: Free Bonus Mod',
      description: 'Get a free exclusive mod with any purchase',
      discount: 0,
      icon: Timer,
      color: 'from-red-600 to-pink-600',
      active: timeLeft > 0 && count > 0
    }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                <ShoppingCart className="h-16 w-16 text-purple-400 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">Please Sign In</h2>
              <p className="text-slate-300 mb-6">
                You need to be signed in to view your cart and start your mod journey.
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-40 h-40 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-600/30 border-t-purple-600 rounded-full mx-auto mb-6"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-300 text-xl"
          >
            Loading your cart...
          </motion.p>
        </div>
      </div>
    );
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
        {/* Header with navigation */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/mods" className="inline-flex items-center text-slate-300 hover:text-white transition-colors group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>

          {/* Limited time offer indicator */}
          <AnimatePresence>
            {timeLeft > 0 && count > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-600/30 rounded-lg px-4 py-2"
              >
                <Timer className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-red-300 text-sm font-medium">
                  Free bonus expires in {formatTime(timeLeft)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Cart content */}
        <div className="grid xl:grid-cols-4 gap-8">
          {/* Main cart section */}
          <div className="xl:col-span-3 space-y-6">
            {/* Cart items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-black/50 backdrop-blur-lg border-purple-900/30 hover:border-purple-600/50 transition-all duration-500">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-2xl">
                    <div className="flex items-center">
                      <ShoppingCart className="h-6 w-6 mr-3 text-purple-400" />
                      <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">Shopping Cart</span>
                      <Badge className="ml-3 bg-gradient-to-r from-purple-600/20 to-green-600/20 text-green-300 border-green-600/30">
                        {count} {count === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>
                    {savings > 0 && (
                      <div className="flex items-center text-green-400">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        <span className="text-sm">You're saving ${savings.toFixed(2)}</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AnimatePresence mode="wait">
                    {count === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-16"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                        >
                          <ShoppingCart className="h-20 w-20 text-purple-400 mx-auto mb-6" />
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">Your cart is empty</h3>
                        <p className="text-slate-300 mb-8 text-lg">
                          Discover amazing mods and add them to your collection!
                        </p>
                        <Link href="/mods">
                          <Button className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-bold px-8 py-3 rounded-xl transition-all duration-300">
                            <Sparkles className="mr-2 h-5 w-5" />
                            Browse Mods
                          </Button>
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.div className="space-y-4">
                        {items.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="group"
                          >
                            <div className="flex gap-6 p-6 border border-purple-900/30 rounded-xl bg-gradient-to-r from-black/50 to-purple-900/10 hover:from-purple-900/20 hover:to-green-900/10 transition-all duration-500 hover:border-green-600/30 cart-item-card">
                              <div className="relative">
                                <img
                                  src={item.mod.previewImageUrl || "/images/mod-placeholder.jpg"}
                                  alt={item.mod.title}
                                  className="w-24 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-green-400 group-hover:bg-clip-text transition-all duration-300">
                                  {item.mod.title}
                                </h3>
                                <p className="text-slate-300 line-clamp-2 mt-2">
                                  {item.mod.description}
                                </p>
                                <div className="flex items-center gap-3 mt-3">
                                  <Badge className="bg-gradient-to-r from-green-600/20 to-purple-600/20 text-green-300 border-green-600/30">
                                    {item.mod.category}
                                  </Badge>
                                  <div className="flex items-center text-sm text-yellow-400">
                                    <Star className="h-4 w-4 mr-1 fill-current" />
                                    4.5
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex flex-col justify-between">
                                <div>
                                  <div className="font-bold text-2xl text-green-400">
                                    ${item.mod.discountPrice || item.mod.price}
                                  </div>
                                  {item.mod.discountPrice && (
                                    <div className="text-sm text-slate-500 line-through">
                                      ${item.mod.price}
                                    </div>
                                  )}
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItemMutation.mutate(item.modId)}
                                    disabled={removeItemMutation.isPending}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/30 hover:border-red-400/50 transition-all duration-300"
                                  >
                                    {removeItemMutation.isPending ? (
                                      <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="h-4 w-4 border-2 border-red-400/30 border-t-red-400 rounded-full"
                                      />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Smart deals section */}
            <AnimatePresence>
              {showUpsells && count > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="bg-black/50 backdrop-blur-lg border-yellow-900/30 hover:border-yellow-600/50 transition-all duration-500">
                    <CardHeader>
                      <CardTitle className="flex items-center text-2xl">
                        <Gift className="h-6 w-6 mr-3 text-yellow-400" />
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Smart Deals</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {deals.filter(deal => deal.active).slice(0, 4).map((deal, index) => (
                          <motion.div
                            key={deal.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="group"
                          >
                            <div className={`p-4 rounded-lg bg-gradient-to-r ${deal.color}/10 border border-transparent group-hover:border-current/30 transition-all duration-300 cursor-pointer`}>
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-r ${deal.color}`}>
                                  <deal.icon className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-current group-hover:to-current group-hover:bg-clip-text transition-all duration-300">
                                    {deal.title}
                                  </h4>
                                  <p className="text-sm text-slate-400 mt-1">
                                    {deal.description}
                                  </p>
                                  {deal.discount > 0 && (
                                    <div className="mt-2">
                                      <Badge className={`bg-gradient-to-r ${deal.color}/20 text-current border-current/30`}>
                                        Save {deal.discount}%
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product recommendations */}
            {recommendedMods?.mods && recommendedMods.mods.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-black/50 backdrop-blur-lg border-green-900/30 hover:border-green-600/50 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <Heart className="h-6 w-6 mr-3 text-green-400" />
                      <span className="bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">You Might Also Like</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recommendedMods.mods.slice(0, 6).map((mod: any, index: number) => {
                        const isInCart = items.some(item => item.modId === mod.id);
                        return (
                          <motion.div
                            key={mod.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="group"
                          >
                            <div className="p-4 border border-green-900/30 rounded-lg bg-gradient-to-br from-black/50 to-green-900/10 hover:from-green-900/20 hover:to-purple-900/10 transition-all duration-500 hover:border-purple-600/30 cursor-pointer">
                              <Link href={`/mod/${mod.id}`}>
                                <img
                                  src={mod.previewImageUrl || "/images/mod-placeholder.jpg"}
                                  alt={mod.title}
                                  className="w-full h-32 object-cover rounded-md mb-3 group-hover:scale-105 transition-transform duration-300"
                                />
                              </Link>
                              <h4 className="font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300 line-clamp-1">
                                {mod.title}
                              </h4>
                              <div className="flex items-center justify-between mt-2">
                                <Badge className="bg-gradient-to-r from-purple-600/20 to-green-600/20 text-purple-300 border-purple-600/30 text-xs">
                                  {mod.category}
                                </Badge>
                                <span className="font-bold text-green-400">${mod.price}</span>
                              </div>
                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  disabled={isInCart || addToCartMutation.isPending}
                                  onClick={() => addToCartMutation.mutate(mod.id)}
                                  className={`w-full transition-all duration-300 ${
                                    isInCart 
                                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                                      : 'bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white'
                                  }`}
                                >
                                  {isInCart ? 'In Cart' : addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Order summary sidebar */}
          {count > 0 && (
            <div className="xl:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-8"
              >
                <Card className="bg-black/50 backdrop-blur-lg border-green-900/30 hover:border-green-600/50 transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="text-2xl bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">Order Summary</CardTitle>
                    <div className="flex items-center text-sm text-slate-400">
                      <Shield className="h-4 w-4 mr-2 text-green-400" />
                      Secure checkout guaranteed
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-lg">
                        <span className="text-slate-300">Subtotal</span>
                        <span className="font-semibold text-white">${total.toFixed(2)}</span>
                      </div>
                      {savings > 0 && (
                        <div className="flex justify-between text-sm text-green-400">
                          <span>You save</span>
                          <span>-${savings.toFixed(2)}</span>
                        </div>
                      )}
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
                        <span className="bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">${total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href="/checkout">
                        <Button className="w-full bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl text-lg transition-all duration-300">
                          <Crown className="h-5 w-5 mr-2" />
                          Proceed to Checkout
                        </Button>
                      </Link>
                    </motion.div>
                    
                    <div className="text-center text-sm text-slate-400">
                      <p>🔒 Secure checkout powered by Stripe</p>
                      <p className="mt-1">💎 Instant download after payment</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Floating deal notifications - positioned at top right */}
      {showFloatingDeal && (
        <FloatingDealNotification 
          onClose={() => setShowFloatingDeal(false)}
        />
      )}
    </div>
  );
}