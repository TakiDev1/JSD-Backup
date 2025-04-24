import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useAnimationControls } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  lifespan: number;
  timestamp: number;
  trailParticle: boolean;
}

const MouseParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 300 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 300 });
  const lastEmitTime = useRef(0);
  const cursorControls = useAnimationControls();
  
  // Settings for solid trail (smaller interval = more solid trail)
  const emitInterval = 4; // ms between particle emissions (much smaller for solid trail)
  const particleLifespan = 1200; // ms - long enough to create a nice trail
  const maxParticles = 150; // Higher max for denser trail
  
  // JSD brand colors
  const primaryColor = "#7300ff";
  const secondaryColor = "#00e5ff";
  const trailColors = [primaryColor, primaryColor, "#8b1aff"]; // More consistent colors for solid trail
  
  // Cursor pulse animation for car-themed cursor
  useEffect(() => {
    cursorControls.start({
      scale: [1, 1.2, 1],
      opacity: [0.7, 0.9, 0.7],
      rotate: [-2, 2, -2], // Slight rotation for "engine revving" effect
      transition: {
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop"
      }
    });
  }, [cursorControls]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      const now = Date.now();
      if (now - lastEmitTime.current >= emitInterval) {
        // Emit 2 particles at once for a more solid trail
        createParticle(e.clientX, e.clientY, true);
        createParticle(e.clientX + (Math.random() * 3 - 1.5), e.clientY + (Math.random() * 3 - 1.5), true);
        
        // Occasionally create accent particles (tire marks/smoke effect)
        if (Math.random() < 0.05) {
          createParticle(e.clientX + (Math.random() * 10 - 5), e.clientY + (Math.random() * 10 - 5), false);
        }
        
        lastEmitTime.current = now;
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      
      setParticles((prevParticles) => {
        // Filter out expired particles
        const updatedParticles = prevParticles
          .filter((p) => now - p.timestamp < p.lifespan)
          .slice(-maxParticles); // Keep only the most recent particles
        
        return updatedParticles;
      });
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const createParticle = (x: number, y: number, isTrailParticle: boolean) => {
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x,
      y,
      // Trail particles are consistent size for solid trail effect
      size: isTrailParticle 
        ? 5 + Math.random() * 2 // More consistent sizes for solid trail
        : 8 + Math.random() * 6,
      // Use consistent colors for trail particles
      color: isTrailParticle 
        ? trailColors[Math.floor(Math.random() * trailColors.length)]
        : Math.random() > 0.5 ? "#33eaff" : "#ff00aa", // Accent particles
      lifespan: isTrailParticle 
        ? particleLifespan
        : particleLifespan * 0.5,
      timestamp: Date.now(),
      trailParticle: isTrailParticle
    };
    
    setParticles((prevParticles) => [...prevParticles, newParticle]);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Main car cursor with pulsing effect */}
      <motion.div 
        className="absolute"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          zIndex: 60
        }}
        animate={cursorControls}
      >
        {/* Car shape - simplified sports car silhouette */}
        <svg width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M28 12H26L22 5C21.4 4 20.3 3 19 3H10C8.7 3 7.6 4 7 5L3 12H2C1.4 12 1 12.4 1 13V15C1 15.6 1.4 16 2 16H3C3 18.2 4.8 20 7 20C9.2 20 11 18.2 11 16H19C19 18.2 20.8 20 23 20C25.2 20 27 18.2 27 16H28C28.6 16 29 15.6 29 15V13C29 12.4 28.6 12 28 12Z"
                fill={primaryColor} stroke={secondaryColor} strokeWidth="1.5" />
          <circle cx="7" cy="16" r="3" fill="#333" stroke={secondaryColor} />
          <circle cx="23" cy="16" r="3" fill="#333" stroke={secondaryColor} />
          <path d="M20 8H10L8 11H22L20 8Z" fill={secondaryColor} />
        </svg>
      </motion.div>
      
      {/* Particle trail - completely solid with no gaps */}
      {particles.map((particle) => {
        const age = Date.now() - particle.timestamp;
        const lifeProgress = age / particle.lifespan;
        
        // Very high starting opacity for solid trail with gradual fade
        const opacity = particle.trailParticle
          ? 0.9 - lifeProgress * 0.9 
          : 0.8 - lifeProgress * 0.8;
        
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            initial={{ 
              opacity: particle.trailParticle ? 0.9 : 0.8, 
              scale: 1,
              filter: "blur(0.5px)" // Minimal blur for sharper trail
            }}
            animate={{ 
              opacity: 0, 
              scale: particle.trailParticle ? 0.8 : 0.5
            }}
            transition={{ 
              duration: particle.lifespan / 1000,
              ease: "linear" // Linear fade for more consistent solid trail
            }}
            style={{
              x: particle.x,
              y: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: particle.trailParticle ? `0 0 2px ${particle.color}` : `0 0 4px ${particle.color}`,
              translateX: "-50%",
              translateY: "-50%",
            }}
          />
        );
      })}
    </div>
  );
};

export default MouseParticles;
