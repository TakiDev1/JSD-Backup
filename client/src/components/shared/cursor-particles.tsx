import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

const CursorParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const colors = [
    'rgba(139, 92, 246, 0.8)', // purple
    'rgba(236, 72, 153, 0.8)', // pink
    'rgba(34, 197, 94, 0.8)',  // green
    'rgba(248, 113, 113, 0.8)', // red
    'rgba(59, 130, 246, 0.8)',  // blue
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Create new particles on mouse move
      if (Math.random() < 0.3) { // 30% chance to create particle
        const newParticle: Particle = {
          id: Math.random().toString(36).substr(2, 9),
          x: e.clientX,
          y: e.clientY,
          life: 60, // frames
          maxLife: 60,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 2,
          velocity: {
            x: (Math.random() - 0.5) * 4,
            y: (Math.random() - 0.5) * 4
          }
        };
        
        setParticles(prev => [...prev, newParticle]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const updateParticles = () => {
      setParticles(prev => 
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.velocity.x,
            y: particle.y + particle.velocity.y,
            life: particle.life - 1,
            velocity: {
              x: particle.velocity.x * 0.98, // friction
              y: particle.velocity.y * 0.98 + 0.1 // gravity
            }
          }))
          .filter(particle => particle.life > 0)
      );
    };

    const interval = setInterval(updateParticles, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">

      
      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            x: particle.x - particle.size / 2,
            y: particle.y - particle.size / 2,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            opacity: particle.life / particle.maxLife,
            scale: [1, 0],
          }}
          transition={{
            duration: particle.life / 60,
            ease: "easeOut",
          }}
        />
      ))}
      
      {/* Additional interactive elements */}
      <motion.div
        className="absolute w-3 h-3 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, #a855f7, #22c55e)',
          x: mousePos.x - 6,
          y: mousePos.y - 6,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Magnetic field effect */}
      <motion.div
        className="absolute w-20 h-20 rounded-full pointer-events-none border border-purple-500/20"
        style={{
          x: mousePos.x - 40,
          y: mousePos.y - 40,
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default CursorParticles;