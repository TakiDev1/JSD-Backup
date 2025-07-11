import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingCart, CreditCard, Download, Star, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CheckoutProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: number;
    title: string;
    description: string;
    icon: any;
    points?: number;
  }>;
  completedSteps: number[];
  userPoints?: number;
}

export function CheckoutProgress({ 
  currentStep, 
  totalSteps, 
  steps, 
  completedSteps,
  userPoints = 0 
}: CheckoutProgressProps) {
  const progressPercentage = (completedSteps.length / totalSteps) * 100;
  const earnedPoints = completedSteps.reduce((sum, stepId) => {
    const step = steps.find(s => s.id === stepId);
    return sum + (step?.points || 0);
  }, 0);

  return (
    <div className="relative">
      {/* Points display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <Badge className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 text-yellow-300 border-yellow-600/30 px-4 py-2">
            <Star className="h-4 w-4 mr-2 fill-current" />
            {userPoints + earnedPoints} Points
          </Badge>
          <AnimatePresence>
            {earnedPoints > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="flex items-center text-green-400 text-sm"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                +{earnedPoints} earned this session
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-slate-400">Progress</div>
          <div className="text-lg font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-green-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        
        {/* Floating progress indicator */}
        <motion.div
          className="absolute -top-1 h-4 w-4 bg-gradient-to-r from-purple-600 to-green-600 rounded-full shadow-lg"
          initial={{ left: 0 }}
          animate={{ left: `${Math.max(0, progressPercentage - 2)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-600 rounded-full animate-ping"></div>
        </motion.div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div
                className={`
                  p-6 rounded-xl border transition-all duration-500 relative overflow-hidden
                  ${isCompleted 
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-600/50 shadow-lg shadow-green-600/20' 
                    : isCurrent
                      ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/20 border-purple-600/50 shadow-lg shadow-purple-600/20 animate-pulse'
                      : 'bg-black/30 border-slate-800/50'
                  }
                `}
              >
                {/* Background animation for current step */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-green-600/10"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Completion celebration effect */}
                <AnimatePresence>
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      className="absolute top-2 right-2"
                    >
                      <div className="p-1 bg-green-600 rounded-full">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative z-10">
                  {/* Step icon */}
                  <motion.div
                    className={`
                      w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300
                      ${isCompleted 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                        : isCurrent
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                          : 'bg-slate-700'
                      }
                    `}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6 text-white" />
                    ) : (
                      <step.icon className="h-6 w-6 text-white" />
                    )}
                  </motion.div>

                  {/* Step content */}
                  <h3 className={`
                    font-bold text-lg mb-2 transition-all duration-300
                    ${isCompleted 
                      ? 'text-green-400' 
                      : isCurrent
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                        : 'text-slate-400'
                    }
                  `}>
                    {step.title}
                  </h3>
                  
                  <p className={`
                    text-sm mb-3 transition-all duration-300
                    ${isCompleted 
                      ? 'text-green-300/80' 
                      : isCurrent
                        ? 'text-purple-300/80'
                        : 'text-slate-500'
                    }
                  `}>
                    {step.description}
                  </p>

                  {/* Points reward */}
                  {step.points && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`
                        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300
                        ${isCompleted 
                          ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/30' 
                          : isCurrent
                            ? 'bg-yellow-600/10 text-yellow-400 border border-yellow-600/20'
                            : 'bg-slate-800/50 text-slate-500 border border-slate-700/50'
                        }
                      `}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {step.points} points
                    </motion.div>
                  )}
                </div>

                {/* Step number indicator */}
                <div className={`
                  absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-600 text-white' 
                    : isCurrent
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }
                `}>
                  {isCompleted ? <Check className="h-3 w-3" /> : step.id}
                </div>
              </div>

              {/* Connection line to next step */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-slate-600 transform -translate-y-1/2 z-20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-600 to-green-600"
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Achievement unlocks */}
      <AnimatePresence>
        {progressPercentage >= 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="mt-8 p-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/20 border border-yellow-600/50 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Crown className="h-8 w-8 text-yellow-400" />
              </motion.div>
              <div>
                <h4 className="font-bold text-yellow-400 text-lg">Checkout Master!</h4>
                <p className="text-yellow-300/80 text-sm">
                  You've completed the checkout process and earned {earnedPoints} bonus points!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}