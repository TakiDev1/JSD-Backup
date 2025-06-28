import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Clock, Zap, Star, Gift, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UrgentPopupProps {
  onClose: () => void;
}

const urgentDeals = [
  {
    id: 'mega-sale',
    title: '🚨 MEGA SALE ENDING SOON!',
    subtitle: 'Last 2 hours to save 70%',
    description: 'The biggest sale of the year is ending soon. Don\'t miss out on these incredible savings!',
    discount: 70,
    originalPrice: 150,
    salePrice: 45,
    timeLeft: 7200, // 2 hours
    gradient: 'from-red-600 via-orange-600 to-yellow-600',
    urgency: 'extreme'
  },
  {
    id: 'flash-deal',
    title: '⚡ FLASH DEAL ALERT!',
    subtitle: 'Limited time only - 1 hour left',
    description: 'Exclusive flash deal on premium mod bundle. Act fast before it\'s gone!',
    discount: 60,
    originalPrice: 80,
    salePrice: 32,
    timeLeft: 3600, // 1 hour
    gradient: 'from-purple-600 via-pink-600 to-red-600',
    urgency: 'high'
  },
  {
    id: 'weekend-special',
    title: '🎯 WEEKEND SPECIAL!',
    subtitle: 'Ends Sunday midnight',
    description: 'Weekend warriors special - get the ultimate drift car collection at an unbeatable price.',
    discount: 50,
    originalPrice: 120,
    salePrice: 60,
    timeLeft: 86400, // 24 hours
    gradient: 'from-blue-600 via-purple-600 to-pink-600',
    urgency: 'medium'
  }
];

export function UrgentPopup({ onClose }: UrgentPopupProps) {
  const [currentDeal] = useState(() => urgentDeals[Math.floor(Math.random() * urgentDeals.length)]);
  const [timeLeft, setTimeLeft] = useState(currentDeal.timeLeft);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Reset timer when it hits 0 to create perpetual urgency
          return currentDeal.timeLeft;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentDeal.timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          className="relative max-w-lg w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`bg-gradient-to-r ${currentDeal.gradient} p-1 rounded-2xl`}>
            <div className="bg-black/90 rounded-xl p-8 relative overflow-hidden">
              {/* Background animations */}
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360] 
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full"
                />
                <motion.div
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    rotate: [360, 180, 0] 
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full"
                />
              </div>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
              >
                <X className="h-5 w-5 text-white" />
              </motion.button>

              {/* Content */}
              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ 
                    scale: currentDeal.urgency === 'extreme' ? [1, 1.05, 1] : 1,
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: currentDeal.urgency === 'extreme' ? Infinity : 0 
                  }}
                >
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {currentDeal.title}
                  </h2>
                  <p className="text-xl text-white/90 mb-6">
                    {currentDeal.subtitle}
                  </p>
                </motion.div>

                {/* Timer */}
                <div className="mb-6">
                  <div className="bg-white/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-white" />
                      <span className="text-white font-semibold">Time Remaining</span>
                    </div>
                    <motion.div
                      key={timeLeft}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-4xl font-bold text-white"
                    >
                      {formatTime(timeLeft)}
                    </motion.div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      animate={{ width: [`${(timeLeft / currentDeal.timeLeft) * 100}%`, '0%'] }}
                      transition={{ duration: timeLeft, ease: "linear" }}
                      className="h-2 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Deal details */}
                <div className="mb-6">
                  <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg font-bold mb-4">
                    SAVE {currentDeal.discount}%
                  </Badge>
                  
                  <p className="text-white/80 mb-4">
                    {currentDeal.description}
                  </p>

                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-2xl text-white/60 line-through">
                      ${currentDeal.originalPrice}
                    </span>
                    <span className="text-4xl font-bold text-white">
                      ${currentDeal.salePrice}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 text-lg rounded-xl"
                      onClick={() => window.location.href = '/mods'}
                    >
                      <Gift className="h-5 w-5 mr-2" />
                      Claim This Deal Now
                    </Button>
                  </motion.div>
                  
                  <Button 
                    variant="ghost"
                    className="w-full text-white/80 hover:text-white hover:bg-white/10"
                    onClick={handleClose}
                  >
                    Maybe later
                  </Button>
                </div>

                {/* Social proof */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 flex items-center justify-center gap-2 text-sm text-white/60"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>247 people claimed this deal in the last hour</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}