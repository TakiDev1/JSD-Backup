import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-green-600 to-purple-600 transform origin-left z-50"
      style={{ scaleX }}
    />
  );
};

export const FloatingCallToAction = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((progress) => {
      // Show CTA when user scrolls past 30% and hide when near bottom
      if (progress > 0.3 && progress < 0.85) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <motion.div
      initial={{ scale: 0, rotate: 180 }}
      animate={isVisible ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 180 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-8 right-8 z-40"
    >
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="bg-gradient-to-r from-purple-600 to-green-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center space-x-2 animate-pulse-glow"
      >
        <span>🚀</span>
        <span>Get Started!</span>
      </motion.button>
    </motion.div>
  );
};

export const ParallaxContainer = ({ children, speed = 0.5 }: { children: React.ReactNode; speed?: number }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

  return (
    <motion.div style={{ y }}>
      {children}
    </motion.div>
  );
};

export const ScrollTriggeredElement = ({ 
  children, 
  animationType = "fadeUp",
  delay = 0 
}: { 
  children: React.ReactNode;
  animationType?: "fadeUp" | "slideLeft" | "slideRight" | "spiral" | "bounce";
  delay?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`scroll-element-${Math.random()}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [delay]);

  const getAnimationProps = () => {
    const baseProps = {
      initial: { opacity: 0 },
      animate: isVisible ? { opacity: 1 } : { opacity: 0 },
      transition: { duration: 0.8, ease: "easeOut" }
    };

    switch (animationType) {
      case "slideLeft":
        return {
          ...baseProps,
          initial: { ...baseProps.initial, x: -100, rotateY: 45 },
          animate: isVisible ? { ...baseProps.animate, x: 0, rotateY: 0 } : { ...baseProps.animate, x: -100, rotateY: 45 }
        };
      case "slideRight":
        return {
          ...baseProps,
          initial: { ...baseProps.initial, x: 100, rotateY: -45 },
          animate: isVisible ? { ...baseProps.animate, x: 0, rotateY: 0 } : { ...baseProps.animate, x: 100, rotateY: -45 }
        };
      case "spiral":
        return {
          ...baseProps,
          initial: { ...baseProps.initial, rotate: 720, scale: 0 },
          animate: isVisible ? { ...baseProps.animate, rotate: 0, scale: 1 } : { ...baseProps.animate, rotate: 720, scale: 0 },
          transition: { duration: 1.2, ease: "easeOut" }
        };
      case "bounce":
        return {
          ...baseProps,
          initial: { ...baseProps.initial, y: 100, scale: 0.3 },
          animate: isVisible ? { ...baseProps.animate, y: 0, scale: 1 } : { ...baseProps.animate, y: 100, scale: 0.3 },
          transition: { type: "spring", stiffness: 260, damping: 20 }
        };
      default:
        return {
          ...baseProps,
          initial: { ...baseProps.initial, y: 50, scale: 0.8 },
          animate: isVisible ? { ...baseProps.animate, y: 0, scale: 1 } : { ...baseProps.animate, y: 50, scale: 0.8 }
        };
    }
  };

  return (
    <motion.div
      id={`scroll-element-${Math.random()}`}
      {...getAnimationProps()}
    >
      {children}
    </motion.div>
  );
};

export const MagneticElement = ({ children }: { children: React.ReactNode }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.25;
    const deltaY = (e.clientY - centerY) * 0.25;
    
    setMousePosition({ x: deltaX, y: deltaY });
  };

  return (
    <motion.div
      animate={{
        x: isHovered ? mousePosition.x : 0,
        y: isHovered ? mousePosition.y : 0,
        scale: isHovered ? 1.05 : 1
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
};