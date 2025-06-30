import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
}

export const AnimatedCard = ({ 
  children, 
  className = "", 
  glowColor = "rgba(147, 51, 234, 0.3)",
  intensity = 1 
}: AnimatedCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct * intensity);
    y.set(yPct * intensity);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY: rotateY,
        rotateX: rotateX,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`relative group cursor-pointer ${className}`}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
          filter: "blur(20px)",
          transform: "translateZ(-1px)",
        }}
      />
      
      {/* Main card */}
      <div
        className="relative bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
        style={{ transform: "translateZ(75px)" }}
      >
        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{
            background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
          }}
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Content */}
        <div style={{ transform: "translateZ(50px)" }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
};