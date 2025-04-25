import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Mod } from "@shared/schema";
import { motion } from "framer-motion";

interface ModCardProps {
  mod: Mod;
}

const ModCard = ({ mod }: ModCardProps) => {
  const { addItem, isModInCart } = useCart();
  const cardRef = useRef<HTMLDivElement>(null);
  const [inCart, setInCart] = useState(false);

  // Setup 3D rotation effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    
    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    };
    
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Check if mod is in cart
  useEffect(() => {
    if (mod && mod.id) {
      setInCart(isModInCart(mod.id));
    }
  }, [isModInCart, mod]);

  const createFlyingAnimation = (button: HTMLElement) => {
    const cartButton = document.querySelector('.cart-button') as HTMLElement;
    if (!button || !cartButton) return;
    
    const buttonRect = button.getBoundingClientRect();
    const cartRect = cartButton.getBoundingClientRect();
    
    // Create flying element
    const flyingItem = document.createElement('div');
    flyingItem.className = 'flying-cart-item';
    flyingItem.style.position = 'fixed';
    flyingItem.style.zIndex = '9999';
    flyingItem.style.width = '20px';
    flyingItem.style.height = '20px';
    flyingItem.style.borderRadius = '50%';
    flyingItem.style.background = 'white';
    flyingItem.style.boxShadow = '0 0 10px rgba(115, 0, 255, 0.7)';
    flyingItem.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
    flyingItem.style.top = `${buttonRect.top + buttonRect.height / 2}px`;
    flyingItem.style.pointerEvents = 'none';
    
    document.body.appendChild(flyingItem);
    
    // Animate
    const animation = flyingItem.animate([
      { 
        left: `${buttonRect.left + buttonRect.width / 2}px`,
        top: `${buttonRect.top + buttonRect.height / 2}px`,
        opacity: 1,
        transform: 'scale(1)'
      },
      { 
        left: `${cartRect.left + cartRect.width / 2}px`,
        top: `${cartRect.top + cartRect.height / 2}px`,
        opacity: 0,
        transform: 'scale(0.5)'
      }
    ], {
      duration: 800,
      easing: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
    });
    
    animation.onfinish = () => {
      if (document.body.contains(flyingItem)) {
        document.body.removeChild(flyingItem);
      }
    };
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("=== ADD TO CART BUTTON CLICKED ===");
    console.log("Mod info:", mod);
    console.log("Mod ID:", mod.id, "Type:", typeof mod.id);
    
    // Prevent double-clicks
    if (inCart) {
      console.log("Item already in cart, not adding again");
      return;
    }
    
    try {
      console.log("Starting add to cart process for mod ID:", mod.id);
      
      // Get the button that was clicked for animation
      const button = e.currentTarget as HTMLElement;
      
      // Optimistically update UI state
      setInCart(true);
      console.log("UI state updated (optimistically)");
      
      // Start animation
      console.log("Starting animation");
      createFlyingAnimation(button);
      
      // Add to cart
      console.log("Calling addItem with mod ID:", mod.id);
      const result = await addItem(mod.id);
      console.log("Add to cart result:", result);
      
      // Verify the cart state after operation
      console.log("Is mod in cart after operation:", isModInCart(mod.id));
    } catch (error) {
      console.error("Error adding to cart:", error);
      
      // If there was an error, reset the inCart state
      console.log("Resetting inCart state due to error");
      setInCart(isModInCart(mod.id));
    }
  };

  return (
    <motion.div 
      className="card-3d bg-dark-card rounded-xl overflow-hidden border border-dark-card hover:border-primary/30 transition-all duration-300 group"
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link href={`/mods/${mod.id}`}>
        <div className="relative">
          <img 
            src={mod.previewImageUrl || "/images/mod-placeholder.jpg"} 
            alt={mod.title} 
            className="w-full h-48 object-cover"
            onError={(e) => {
              // Use a placeholder if image fails to load
              (e.target as HTMLImageElement).src = "/images/mod-placeholder.jpg";
            }}
          />
          <div className="absolute top-4 right-4 bg-primary text-white text-sm font-semibold py-1 px-3 rounded-full">
            ${mod.discountPrice?.toFixed(2) || mod.price.toFixed(2)}
          </div>
          {mod.isSubscriptionOnly && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-secondary text-white">Premium</Badge>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-dark bg-opacity-70 text-white text-sm font-semibold py-1 px-3 rounded-md">
            <i className="fas fa-star text-yellow-400 mr-1"></i> {mod.averageRating?.toFixed(1) || "New"} ({mod.downloadCount})
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-display font-bold text-white mb-2 group-hover:text-primary-light transition-colors">
            {mod.title}
          </h3>
          <p className="text-neutral text-sm mb-4 line-clamp-2">{mod.description}</p>
          <div className="flex items-center mb-4">
            <Badge className="bg-dark text-secondary">{mod.category}</Badge>
            {mod.tags && mod.tags[0] && (
              <Badge className="ml-1 bg-dark text-secondary">{mod.tags[0]}</Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              className="flex-1 bg-primary hover:bg-primary-light text-white font-display font-semibold py-2 rounded transition-colors"
              onClick={handleAddToCart}
              disabled={inCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {inCart ? "Added to Cart" : "Add to Cart"}
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              className="w-10 flex items-center justify-center bg-dark-lighter hover:bg-dark text-white font-medium py-2 rounded transition-colors"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ModCard;
