import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  lifespan: number;
  timestamp: number;
}

const MouseParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const requestRef = useRef<number | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 100 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 100 });
  const lastEmitTime = useRef(0);
  const emitInterval = 15; // ms between particle emissions
  const particleLifespan = 1000; // ms
  const maxParticles = 50;
  
  // Colors for particles
  const colors = ["#7300ff", "#8b1aff", "#00e5ff", "#33eaff"];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      const now = Date.now();
      if (now - lastEmitTime.current >= emitInterval) {
        createParticle(e.clientX, e.clientY);
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

  const createParticle = (x: number, y: number) => {
    const newParticle: Particle = {
      id: Date.now(),
      x,
      y,
      size: Math.random() * 8 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      lifespan: Math.random() * 500 + particleLifespan,
      timestamp: Date.now(),
    };
    
    setParticles((prevParticles) => [...prevParticles, newParticle]);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <motion.div
        className="absolute w-4 h-4 rounded-full bg-primary opacity-30"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      
      {particles.map((particle) => {
        const age = Date.now() - particle.timestamp;
        const opacity = 1 - age / particle.lifespan;
        const scale = 1 - age / particle.lifespan;
        
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{ opacity: 0, scale: 0.5 }}
            transition={{ 
              duration: particle.lifespan / 1000,
              ease: "easeOut" 
            }}
            style={{
              x: particle.x,
              y: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
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
