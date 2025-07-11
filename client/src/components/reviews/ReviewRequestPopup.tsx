import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, X, MessageSquare, ThumbsUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface ReviewRequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  modTitle: string;
  modId: number;
}

const ReviewRequestPopup: React.FC<ReviewRequestPopupProps> = ({
  isOpen,
  onClose,
  modTitle,
  modId
}) => {
  const [, setLocation] = useLocation();
  const [dismissed, setDismissed] = useState(false);

  // Auto-close after 10 seconds if not interacted with
  useEffect(() => {
    if (isOpen && !dismissed) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, dismissed, onClose]);

  const handleReviewClick = () => {
    setDismissed(true);
    onClose();
    setLocation(`/mods/${modId}?review=true`);
  };

  const handleRemindLater = () => {
    setDismissed(true);
    onClose();
    // Store in localStorage to remind later
    localStorage.setItem(`reviewReminder_${modId}`, Date.now().toString());
  };

  const handleNeverRemind = () => {
    setDismissed(true);
    onClose();
    // Store permanently in localStorage
    localStorage.setItem(`neverRemindReview_${modId}`, "true");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative max-w-md w-full"
        >
          <Card className="bg-slate-900/95 border-purple-600/30 shadow-2xl shadow-purple-600/20 backdrop-blur-sm">
            <CardHeader className="relative pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-2 right-2 text-slate-400 hover:text-white h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto mb-3 w-12 h-12 bg-gradient-to-r from-purple-600 to-green-600 rounded-full flex items-center justify-center"
                >
                  <Star className="h-6 w-6 text-white" />
                </motion.div>
                
                <CardTitle className="text-white text-lg mb-2">
                  How was your experience?
                </CardTitle>
                
                <Badge 
                  variant="outline" 
                  className="bg-purple-600/20 text-purple-400 border-purple-600/30"
                >
                  {modTitle}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-slate-300 text-center text-sm leading-relaxed"
              >
                Your feedback helps us create better mods and helps other users discover amazing content!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Button
                  onClick={handleReviewClick}
                  className="w-full bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-medium py-2.5"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRemindLater}
                    className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 text-xs py-2"
                  >
                    Remind Later
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleNeverRemind}
                    className="text-slate-500 hover:text-slate-400 text-xs py-2"
                  >
                    Never Ask
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="border-t border-slate-700 pt-3 mt-4"
              >
                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                  <ThumbsUp className="h-3 w-3" />
                  <span>Help the community grow</span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewRequestPopup;