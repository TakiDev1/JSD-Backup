import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Timer, Zap, Star, Crown, Gift, TrendingUp, Sparkles, ShoppingBag, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  type: 'flash' | 'bundle' | 'premium' | 'limited' | 'seasonal';
  timeLeft: number; // in seconds
  icon: any;
  gradient: string;
  urgency: 'high' | 'medium' | 'low';
  action: string;
  originalPrice?: number;
  salePrice?: number;
}

const dealTemplates: Omit<Deal, 'timeLeft'>[] = [
  {
    id: 'flash-sale',
    title: '⚡ FLASH SALE',
    description: 'Limited time: 40% off all premium mods',
    discount: 40,
    type: 'flash',
    icon: Zap,
    gradient: 'from-red-600 via-orange-600 to-yellow-600',
    urgency: 'high',
    action: 'Shop Flash Sale',
    originalPrice: 99,
    salePrice: 59
  },
  {
    id: 'weekend-special',
    title: '🎯 WEEKEND WARRIORS',
    description: 'Drift car bundle - 3 cars for the price of 2',
    discount: 33,
    type: 'bundle',
    icon: Target,
    gradient: 'from-purple-600 via-pink-600 to-red-600',
    urgency: 'medium',
    action: 'Get Bundle',
    originalPrice: 75,
    salePrice: 50
  },
  {
    id: 'premium-upgrade',
    title: '👑 VIP ACCESS',
    description: 'Premium membership - First month 50% off',
    discount: 50,
    type: 'premium',
    icon: Crown,
    gradient: 'from-yellow-600 via-orange-600 to-red-600',
    urgency: 'medium',
    action: 'Go Premium',
    originalPrice: 29,
    salePrice: 14
  },
  {
    id: 'mega-monday',
    title: '💫 MEGA MONDAY',
    description: 'Buy 2 get 1 FREE on all vehicle mods',
    discount: 33,
    type: 'limited',
    icon: Sparkles,
    gradient: 'from-green-600 via-teal-600 to-blue-600',
    urgency: 'high',
    action: 'Shop Now',
    originalPrice: 60,
    salePrice: 40
  },
  {
    id: 'summer-blowout',
    title: '🏖️ SUMMER BLOWOUT',
    description: 'Hot deals on sports cars - Up to 60% off',
    discount: 60,
    type: 'seasonal',
    icon: TrendingUp,
    gradient: 'from-orange-600 via-red-600 to-pink-600',
    urgency: 'high',
    action: 'Shop Summer Sale',
    originalPrice: 120,
    salePrice: 48
  },
  {
    id: 'loyalty-bonus',
    title: '⭐ LOYALTY REWARD',
    description: 'Exclusive 35% off for returning customers',
    discount: 35,
    type: 'limited',
    icon: Star,
    gradient: 'from-purple-600 via-blue-600 to-teal-600',
    urgency: 'medium',
    action: 'Claim Reward',
    originalPrice: 80,
    salePrice: 52
  }
];

export function SalesBanner() {
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  // Rotate deals every 1-2 minutes for maximum impact
  useEffect(() => {
    const getRandomDeal = () => {
      const template = dealTemplates[Math.floor(Math.random() * dealTemplates.length)];
      const timeVariations = [900, 1200, 1800, 2400]; // 15min, 20min, 30min, 40min
      const randomTime = timeVariations[Math.floor(Math.random() * timeVariations.length)];
      
      return {
        ...template,
        timeLeft: randomTime
      };
    };

    // Set initial deal
    setCurrentDeal(getRandomDeal());

    // Rotate deals every 1-2 minutes for more engagement
    const dealRotationInterval = setInterval(() => {
      setCurrentDeal(getRandomDeal());
      setIsVisible(true);
    }, Math.random() * 60000 + 60000); // 1-2 minutes

    return () => clearInterval(dealRotationInterval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!currentDeal) return;

    setTimeLeft(currentDeal.timeLeft);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // "Extend" the deal with a new timer when it hits 0
          const newTime = Math.random() * 1800 + 1200; // 20-50 minutes
          return newTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentDeal]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'animate-pulse urgent-pulse';
      case 'medium':
        return 'animate-bounce';
      default:
        return '';
    }
  };

  if (!currentDeal || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className={`fixed top-0 left-0 right-0 z-50 ${getUrgencyStyle(currentDeal.urgency)}`}
      >
        <div className={`bg-gradient-to-r ${currentDeal.gradient} relative overflow-hidden`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              animate={{ x: [0, 100, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
          </div>

          <div className="container mx-auto px-4 py-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Deal icon with animation */}
                <motion.div
                  animate={{ 
                    rotate: currentDeal.urgency === 'high' ? [0, 10, -10, 0] : 0,
                    scale: currentDeal.urgency === 'high' ? [1, 1.1, 1] : 1
                  }}
                  transition={{ 
                    duration: currentDeal.urgency === 'high' ? 0.5 : 1,
                    repeat: currentDeal.urgency === 'high' ? Infinity : 0,
                    repeatDelay: 1
                  }}
                  className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                >
                  <currentDeal.icon className="h-6 w-6 text-white" />
                </motion.div>

                {/* Deal content */}
                <div className="flex items-center gap-6">
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {currentDeal.title}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {currentDeal.description}
                    </p>
                  </div>

                  {/* Savings badge */}
                  <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 text-sm font-bold">
                    SAVE {currentDeal.discount}%
                  </Badge>

                  {/* Price display */}
                  {currentDeal.originalPrice && currentDeal.salePrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 line-through text-sm">
                        ${currentDeal.originalPrice}
                      </span>
                      <span className="text-white font-bold text-lg">
                        ${currentDeal.salePrice}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Countdown timer */}
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                  <Timer className="h-4 w-4 text-white" />
                  <span className="text-white font-bold text-sm">
                    {formatTime(timeLeft)}
                  </span>
                </div>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="bg-white text-black hover:bg-white/90 font-bold px-6 py-2 rounded-lg transition-all duration-300 shadow-lg"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {currentDeal.action}
                  </Button>
                </motion.div>

                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsVisible(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Urgency indicator */}
          {currentDeal.urgency === 'high' && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-white/50"
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Floating deal notifications
export function FloatingDealNotification({ onClose }: { onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  
  const notifications = [
    {
      id: 'limited-stock',
      title: '🔥 Limited Stock Alert',
      message: 'Only 3 premium drift cars left at 50% off!',
      type: 'warning',
      gradient: 'from-orange-600 to-red-600'
    },
    {
      id: 'price-drop',
      title: '📉 Price Drop Alert',
      message: 'JSD Hypersonic GTX just dropped to $15 (was $25)',
      type: 'success',
      gradient: 'from-green-600 to-teal-600'
    },
    {
      id: 'bundle-deal',
      title: '🎁 Bundle Opportunity',
      message: 'Add 1 more car to unlock 30% off everything!',
      type: 'info',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      id: 'flash-sale',
      title: '⚡ Flash Sale Alert',
      message: 'Flash sale starts in 5 minutes - 60% off all mods!',
      type: 'warning',
      gradient: 'from-yellow-600 to-orange-600'
    },
    {
      id: 'new-customer',
      title: '🎉 Welcome Bonus',
      message: 'New customers get 40% off their first purchase!',
      type: 'success',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      id: 'social-proof',
      title: '👥 Popular Choice',
      message: '127 people bought this mod in the last hour!',
      type: 'info',
      gradient: 'from-indigo-600 to-blue-600'
    }
  ];

  const notification = notifications[Math.floor(Math.random() * notifications.length)];

  useEffect(() => {
    // Auto-hide after 6 seconds for faster cycling
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      className="fixed top-20 right-6 z-50 max-w-sm"
    >
      <div className={`bg-gradient-to-r ${notification.gradient} rounded-xl p-4 shadow-2xl backdrop-blur-sm border border-white/20`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-bold text-white text-sm mb-1">
              {notification.title}
            </h4>
            <p className="text-white/90 text-xs">
              {notification.message}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="p-1 hover:bg-white/20 rounded-full transition-colors ml-2"
          >
            <X className="h-4 w-4 text-white" />
          </motion.button>
        </div>
        
        <motion.div
          animate={{ width: ['100%', '0%'] }}
          transition={{ duration: 6, ease: "linear" }}
          className="h-1 bg-white/30 rounded-full mt-3"
        />
      </div>
    </motion.div>
  );
}

// Sticky bottom banner for urgent deals
export function StickyDealBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentOffer, setCurrentOffer] = useState(0);

  const offers = [
    {
      text: "🎯 LAST CHANCE: 48 hours left for 40% off premium mods",
      gradient: "from-red-600 to-orange-600",
      action: "Claim Deal"
    },
    {
      text: "⚡ FLASH: Buy any 2 mods, get 1 FREE - Ends midnight!",
      gradient: "from-purple-600 to-pink-600", 
      action: "Shop Flash Sale"
    },
    {
      text: "👑 VIP EXCLUSIVE: Premium members get 60% off everything",
      gradient: "from-yellow-600 to-orange-600",
      action: "Go Premium"
    }
  ];

  // Rotate offers every 8 seconds for more engagement
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffer(prev => (prev + 1) % offers.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [offers.length]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      <div className={`bg-gradient-to-r ${offers[currentOffer].gradient} relative overflow-hidden`}>
        {/* Animated background */}
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
        
        <div className="container mx-auto px-4 py-3 relative z-10">
          <div className="flex items-center justify-between">
            <motion.p 
              key={currentOffer}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-white font-semibold text-sm flex-1 text-center"
            >
              {offers[currentOffer].text}
            </motion.p>
            
            <div className="flex items-center gap-3">
              <Button 
                size="sm"
                className="bg-white text-black hover:bg-white/90 font-bold px-4 py-1 text-xs"
              >
                {offers[currentOffer].action}
              </Button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}