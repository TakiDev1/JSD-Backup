import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
}

export const MagneticButton = ({ 
  children, 
  className = "",
  strength = 0.4,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false
}: MagneticButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });
  
  const rotateX = useTransform(springY, [-100, 100], ["8deg", "-8deg"]);
  const rotateY = useTransform(springX, [-100, 100], ["-8deg", "8deg"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    x.set(deltaX);
    y.set(deltaY);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-green-600 text-white border-0 shadow-lg hover:shadow-purple-500/25",
    secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20",
    ghost: "bg-transparent text-white border border-white/30 hover:bg-white/10",
    destructive: "bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 shadow-lg hover:shadow-red-500/25"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg"
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      style={{
        x: springX,
        y: springY,
        rotateX: rotateX,
        rotateY: rotateY,
      }}
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.95,
        transition: { duration: 0.1 }
      }}
      className={`
        relative group font-semibold rounded-lg transition-all duration-300 
        ${variants[variant]} ${sizes[size]} ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transform-gpu will-change-transform
      `}
    >
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0 group-active:opacity-100"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Shimmer effect */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100"
          style={{
            background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
          }}
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
      
      {/* Content */}
      <span className="relative z-10">
        {children}
      </span>
    </motion.button>
  );
};