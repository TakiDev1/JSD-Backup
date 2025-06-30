import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, Download, Users, Star, Zap, Sparkles, Rocket } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FloatingParticles } from "../interactive/floating-particles";
import { AnimatedCard } from "../interactive/animated-card";
import { MagneticButton } from "../interactive/magnetic-button";
import { TextReveal } from "../interactive/text-reveal";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  
  const { data: settings } = useQuery({
    queryKey: ['/api/admin/settings'],
  });

  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -100]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      
      mouseX.set(x * 50);
      mouseY.set(y * 50);
      
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const stats = [
    { 
      label: "Total Downloads", 
      value: settings?.totalDownloads || "0",
      icon: Download,
      color: "from-green-400 to-emerald-600",
      accent: "text-green-400"
    },
    { 
      label: "Happy Users", 
      value: settings?.happyUsers || "0",
      icon: Users,
      color: "from-purple-400 to-violet-600",
      accent: "text-purple-400"
    },
    { 
      label: "Mods Created", 
      value: settings?.modsCreated || "0",
      icon: Star,
      color: "from-yellow-400 to-orange-600",
      accent: "text-yellow-400"
    },
  ];

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Floating Particles */}
      <FloatingParticles 
        count={80} 
        colors={["#a855f7", "#22c55e", "#3b82f6", "#f59e0b", "#ef4444"]}
        interactive={true}
      />

      {/* Dynamic background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-green-900/30" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)",
            x: springX,
            y: springY,
          }}
          animate={{
            scale: [1, 1.3, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%)",
            x: useTransform(springX, (x) => -x * 0.5),
            y: useTransform(springY, (y) => -y * 0.5),
          }}
          animate={{
            scale: [1, 1.2, 1.4, 1],
            rotate: [360, 270, 180, 90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Electric arcs */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-32 bg-gradient-to-t from-transparent via-purple-500/30 to-transparent"
              style={{
                transformOrigin: "bottom center",
                transform: `rotate(${i * 45}deg) translateY(-200px)`,
              }}
              animate={{
                scaleY: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 text-center max-w-7xl mx-auto px-4">
        {/* Main heading with extreme animation */}
        <motion.div
          className="mb-8"
          style={{ y: y1 }}
        >
          <TextReveal delay={0.2} direction="up" stagger={0.1}>
            <h1 className="text-7xl md:text-9xl font-black mb-6 leading-none">
              <motion.span 
                className="inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-green-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                PREMIUM
              </motion.span>
              <br />
              <motion.span 
                className="inline-block bg-gradient-to-r from-green-400 via-blue-500 to-purple-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"],
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.5
                }}
              >
                BEAMNG
              </motion.span>
              <br />
              <motion.span 
                className="inline-block relative"
                whileHover={{ scale: 1.05 }}
              >
                <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  MODS
                </span>
                <motion.div
                  className="absolute -top-4 -right-4"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </motion.span>
            </h1>
          </TextReveal>
        </motion.div>

        {/* Animated subtitle */}
        <motion.div style={{ y: y2 }}>
          <TextReveal delay={0.8} direction="up">
            <p className="text-xl md:text-3xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Discover the <span className="text-purple-400 font-semibold">ultimate collection</span> of premium BeamNG.drive mods.
              <br />
              From <span className="text-green-400 font-semibold">realistic vehicles</span> to <span className="text-blue-400 font-semibold">immersive maps</span>, 
              elevate your gaming experience.
            </p>
          </TextReveal>
        </motion.div>

        {/* Interactive buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          style={{ y: y3 }}
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Link href="/mods">
              <MagneticButton 
                variant="primary" 
                size="lg" 
                className="px-10 py-4 text-xl font-bold"
                strength={0.8}
              >
                <Rocket className="w-6 h-6 mr-2" />
                Browse Mods
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Zap className="w-4 h-4 text-yellow-300" />
                </motion.div>
              </MagneticButton>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <Link href="/forum">
              <MagneticButton 
                variant="ghost" 
                size="lg" 
                className="px-10 py-4 text-xl font-bold"
                strength={0.8}
              >
                <Users className="w-6 h-6 mr-2" />
                Join Community
              </MagneticButton>
            </Link>
          </motion.div>
        </motion.div>

        {/* Interactive stats cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6 }}
        >
          {stats.map((stat, index) => (
            <AnimatedCard
              key={stat.label}
              className="group"
              glowColor={stat.color.includes('green') ? 'rgba(34, 197, 94, 0.4)' : 
                         stat.color.includes('purple') ? 'rgba(147, 51, 234, 0.4)' : 
                         'rgba(251, 191, 36, 0.4)'}
              intensity={1.5}
            >
              <div className="p-8 text-center">
                <motion.div
                  className="flex items-center justify-center mb-6"
                  whileHover={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={`p-4 rounded-full bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                
                <motion.div 
                  className="text-4xl font-black text-white mb-3"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}
                </motion.div>
                
                <div className="text-slate-400 text-sm uppercase tracking-widest font-semibold">
                  {stat.label}
                </div>

                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-transparent"
                  style={{
                    background: `linear-gradient(45deg, transparent, ${stat.accent.replace('text-', 'rgba(').replace('-400', ', 0.5)')}), transparent) border-box`,
                    mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                    maskComposite: "subtract",
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>
            </AnimatedCard>
          ))}
        </motion.div>

        {/* Animated scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ 
            y: [0, 15, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.2 }}
          >
            <ArrowDown className="w-8 h-8 text-white/70" />
            <motion.div
              className="absolute inset-0"
              animate={{
                boxShadow: ["0 0 0 0 rgba(255,255,255,0.7)", "0 0 0 10px rgba(255,255,255,0)", "0 0 0 0 rgba(255,255,255,0)"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;