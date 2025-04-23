import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useAnimationControls, animate } from "framer-motion";

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
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 200 });
  const lastEmitTime = useRef(0);
  const cursorControls = useAnimationControls();
  
  const emitInterval = 8; // ms between particle emissions (lower = more solid trail)
  const particleLifespan = 1500; // ms - longer life for more visible trail
  const maxParticles = 100; // Higher max for denser trail
  
  // JSD brand colors
  const primaryColor = "#7300ff";
  const secondaryColor = "#00e5ff";
  const colors = [primaryColor, "#8b1aff", secondaryColor, "#33eaff", "#ff00aa"];
  
  // Cursor pulse animation
  useEffect(() => {
    cursorControls.start({
      scale: [1, 1.3, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 2,
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
        createParticle(e.clientX, e.clientY, true); // Trail particles
        
        // Occasionally create accent particles
        if (Math.random() < 0.1) {
          createParticle(e.clientX, e.clientY, false); // Accent particles
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
          .slice(-maxParticles); // Keep only the most recent particles up to maxParticles
        
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
      // Trail particles are smaller and more consistent for the solid trail effect
      size: isTrailParticle 
        ? 6 + Math.random() * 4
        : 10 + Math.random() * 15,
      // Use more consistent colors for trail particles
      color: isTrailParticle 
        ? colors[Math.floor(Math.random() * 2)] // Primarily use the first two colors for trail
        : colors[Math.floor(Math.random() * colors.length)],
      lifespan: isTrailParticle 
        ? particleLifespan
        : particleLifespan * 0.7,
      timestamp: Date.now(),
      trailParticle: isTrailParticle
    };
    
    setParticles((prevParticles) => [...prevParticles, newParticle]);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Main cursor ball with pulsing effect */}
      <motion.div
        className="absolute rounded-full shadow-lg shadow-primary/50"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          width: 24,
          height: 24,
          background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          filter: "blur(1px)"
        }}
        animate={cursorControls}
      />
      
      {/* Small center dot for precision */}
      <motion.div
        className="absolute rounded-full bg-white"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          width: 4,
          height: 4,
          zIndex: 60
        }}
      />
      
      {/* Particle trail */}
      {particles.map((particle) => {
        const age = Date.now() - particle.timestamp;
        const lifeProgress = age / particle.lifespan;
        const opacity = particle.trailParticle
          ? 0.8 - lifeProgress * 0.8 // Trail particles maintain higher opacity
          : 1 - lifeProgress;
        
        // Apply different styles based on particle type
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            initial={{ 
              opacity: particle.trailParticle ? 0.8 : 0.9, 
              scale: 1,
              filter: particle.trailParticle ? "blur(1px)" : "blur(2px)"
            }}
            animate={{ 
              opacity: 0, 
              scale: particle.trailParticle ? 0.7 : 0.2
            }}
            transition={{ 
              duration: particle.lifespan / 1000,
              ease: particle.trailParticle ? "linear" : "easeOut" 
            }}
            style={{
              x: particle.x,
              y: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: particle.trailParticle ? "none" : `0 0 8px ${particle.color}`,
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
