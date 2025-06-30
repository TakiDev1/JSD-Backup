import { motion } from "framer-motion";
import { useDynamicBackground } from "@/hooks/use-dynamic-background";

export const DynamicBackground = () => {
  const { backgroundStyle, isActive, gradientState } = useDynamicBackground();

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0"
      style={backgroundStyle}
    >
      {/* Primary gradient layer */}
      <motion.div
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{
          background: `radial-gradient(circle at var(--dynamic-position-x, 30%) var(--dynamic-position-y, 20%), 
            hsla(var(--dynamic-primary-hue, 270), 70%, 60%, var(--dynamic-intensity, 0.15)), 
            transparent 70%)`,
          transform: `rotate(var(--dynamic-rotation, 0deg))`,
          opacity: isActive ? 1 : 0.7,
        }}
        animate={{
          scale: isActive ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Secondary gradient layer */}
      <motion.div
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(circle at ${100 - gradientState.position.x}% ${100 - gradientState.position.y}%, 
            hsla(var(--dynamic-secondary-hue, 120), 60%, 55%, calc(var(--dynamic-intensity, 0.15) * 0.8)), 
            transparent 60%)`,
          transform: `rotate(calc(var(--dynamic-rotation, 0deg) * -0.5))`,
          opacity: gradientState.opacity * 0.8,
        }}
        animate={{
          scale: isActive ? [1.05, 1, 1.05] : 1,
        }}
        transition={{
          duration: 3,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Tertiary accent layer */}
      <motion.div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle at 50% 50%, 
            hsla(calc(var(--dynamic-primary-hue, 270) + 60), 50%, 70%, calc(var(--dynamic-intensity, 0.15) * 0.3)), 
            transparent 40%)`,
          transform: `rotate(calc(var(--dynamic-rotation, 0deg) * 0.2))`,
          opacity: isActive ? gradientState.opacity * 0.5 : gradientState.opacity * 0.3,
          mixBlendMode: 'soft-light',
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: isActive ? [0, 360] : 0,
        }}
        transition={{
          scale: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 20,
            repeat: isActive ? Infinity : 0,
            ease: "linear",
          },
        }}
      />

      {/* Animated particles */}
      {isActive && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: `hsla(var(--dynamic-primary-hue, 270), 80%, 70%, 0.4)`,
                left: `${20 + i * 15}%`,
                top: `${10 + i * 20}%`,
              }}
              animate={{
                x: [0, 100, -50, 0],
                y: [0, -100, 50, 0],
                opacity: [0, 1, 0.5, 0],
                scale: [0, 1.5, 0.8, 0],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </>
      )}

      {/* Scroll-based vertical gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: `linear-gradient(to bottom, 
            hsla(var(--dynamic-primary-hue, 270), 30%, 20%, calc(var(--dynamic-intensity, 0.15) * 0.5)), 
            transparent 30%, 
            transparent 70%, 
            hsla(var(--dynamic-secondary-hue, 120), 30%, 20%, calc(var(--dynamic-intensity, 0.15) * 0.3)))`,
          opacity: gradientState.opacity * 0.6,
        }}
      />
    </div>
  );
};