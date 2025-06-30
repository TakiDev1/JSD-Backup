import { motion, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  stagger?: number;
}

export const TextReveal = ({ 
  children, 
  className = "",
  delay = 0,
  duration = 0.8,
  direction = "up",
  stagger = 0.1
}: TextRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  const directions = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { x: 50, y: 0 },
    right: { x: -50, y: 0 },
  };

  const textContent = typeof children === 'string' ? children : '';
  const words = textContent.split(' ');

  if (typeof children === 'string' && words.length > 1) {
    return (
      <div ref={ref} className={className}>
        {words.map((word, index) => (
          <motion.span
            key={index}
            className="inline-block mr-2"
            initial={{ 
              opacity: 0, 
              ...directions[direction]
            }}
            animate={isInView ? { 
              opacity: 1, 
              x: 0, 
              y: 0 
            } : {}}
            transition={{ 
              duration,
              delay: delay + index * stagger,
              ease: [0.25, 0.4, 0.25, 1]
            }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ 
        opacity: 0, 
        ...directions[direction]
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        y: 0 
      } : {}}
      transition={{ 
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  );
};