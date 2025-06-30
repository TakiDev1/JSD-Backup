import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  duration: number;
}

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  interactive?: boolean;
}

export const FloatingParticles = ({ 
  count = 50, 
  colors = ["#a855f7", "#22c55e", "#3b82f6", "#f59e0b"],
  interactive = true 
}: FloatingParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const generateParticles = (): Particle[] => {
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 20 + 10,
      }));
    };

    setParticles(generateParticles());
  }, [count, colors]);

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => {
        const distanceFromMouse = interactive ? Math.sqrt(
          Math.pow(particle.x - mousePosition.x, 2) + 
          Math.pow(particle.y - mousePosition.y, 2)
        ) : 50;
        
        const attraction = interactive ? Math.max(0, 30 - distanceFromMouse) / 30 : 0;

        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              filter: "blur(0.5px)",
            }}
            animate={{
              x: [
                `${particle.x}vw`, 
                `${particle.x + (Math.random() - 0.5) * 20}vw`, 
                `${particle.x}vw`
              ],
              y: [
                `${particle.y}vh`, 
                `${particle.y + (Math.random() - 0.5) * 20}vh`, 
                `${particle.y}vh`
              ],
              scale: interactive ? [1, 1 + attraction * 2, 1] : [1, 1.2, 1],
              opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        );
      })}
    </div>
  );
};