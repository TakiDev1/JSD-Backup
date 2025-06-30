import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star, Download, ShoppingCart, Eye, Zap } from "lucide-react";
import { useRef, useState } from "react";
import { AnimatedCard } from "./animated-card";
import { MagneticButton } from "./magnetic-button";
import { TextReveal } from "./text-reveal";

interface InteractiveModCardProps {
  mod: {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPrice?: number | null;
    previewImageUrl?: string;
    category: string;
    tags?: string[];
  };
  onAddToCart?: (modId: number) => void;
  isInCart?: boolean;
  index?: number;
}

export const InteractiveModCard = ({ 
  mod, 
  onAddToCart, 
  isInCart = false,
  index = 0 
}: InteractiveModCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  const springX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformStyle: "preserve-3d",
      }}
      className="group perspective-1000"
    >
      <AnimatedCard 
        className="h-full overflow-hidden"
        glowColor={isInCart ? "rgba(34, 197, 94, 0.4)" : "rgba(147, 51, 234, 0.4)"}
        intensity={1.2}
      >
        {/* Image Section with Parallax Effect */}
        <div className="relative h-48 overflow-hidden">
          {mod.previewImageUrl ? (
            <motion.img
              src={mod.previewImageUrl}
              alt={mod.title}
              className="w-full h-full object-cover"
              style={{ 
                transform: "translateZ(20px)",
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.6 }}
            />
          ) : (
            <div 
              className="w-full h-full bg-gradient-to-br from-purple-600/20 to-green-600/20 flex items-center justify-center"
              style={{ transform: "translateZ(20px)" }}
            >
              <Eye className="w-12 h-12 text-purple-400" />
            </div>
          )}
          
          {/* Floating overlay elements */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
            style={{ transform: "translateZ(30px)" }}
          />
          
          {/* Category badge */}
          <motion.div
            className="absolute top-3 left-3"
            style={{ transform: "translateZ(40px)" }}
            whileHover={{ scale: 1.1 }}
          >
            <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-purple-500/30">
              {mod.category}
            </span>
          </motion.div>

          {/* Interactive stats */}
          <motion.div
            className="absolute top-3 right-3 space-y-2"
            style={{ transform: "translateZ(40px)" }}
          >
            <motion.div 
              className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.8)" }}
            >
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-white text-xs font-medium">4.9</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.8)" }}
            >
              <Download className="w-3 h-3 text-green-400" />
              <span className="text-white text-xs font-medium">2.1K</span>
            </motion.div>
          </motion.div>

          {/* Energy bolts animation when hovered */}
          {isHovered && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ transform: "translateZ(50px)" }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${10 + i * 20}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360] 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.2, 
                    repeat: Infinity,
                    repeatDelay: 2 
                  }}
                >
                  <Zap className="w-4 h-4 text-purple-400" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Content Section */}
        <div 
          className="p-6"
          style={{ transform: "translateZ(30px)" }}
        >
          <TextReveal delay={index * 0.1}>
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
              {mod.title}
            </h3>
          </TextReveal>
          
          <TextReveal delay={index * 0.1 + 0.1}>
            <p className="text-slate-300 text-sm mb-4 line-clamp-2">
              {mod.description}
            </p>
          </TextReveal>

          {/* Tags */}
          {mod.tags && mod.tags.length > 0 && (
            <motion.div 
              className="flex flex-wrap gap-1 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {mod.tags.slice(0, 3).map((tag, tagIndex) => (
                <motion.span
                  key={tag}
                  className="px-2 py-1 bg-white/10 text-white text-xs rounded-md border border-white/20"
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: "rgba(147, 51, 234, 0.3)" 
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 + tagIndex * 0.1 }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          )}

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
            >
              {mod.discountPrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 line-through text-sm">${mod.price}</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    ${mod.discountPrice}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-white">${mod.price}</span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              style={{ transform: "translateZ(20px)" }}
            >
              <MagneticButton
                variant={isInCart ? "secondary" : "primary"}
                size="sm"
                onClick={() => onAddToCart?.(mod.id)}
                disabled={isInCart}
                strength={0.6}
              >
                {isInCart ? (
                  <>
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add to Cart
                  </>
                )}
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </AnimatedCard>
    </motion.div>
  );
};