import { motion, useScroll, useTransform } from "framer-motion";
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
  
  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);
  const y3 = useTransform(scrollY, [0, 300], [0, -20]);

  // Get site stats
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/admin/settings"],
  });

  const stats = [
    {
      icon: Download,
      value: siteSettings?.totalDownloads || "0",
      label: "Downloads",
      color: "from-green-500 to-emerald-600",
      accent: "text-green-400"
    },
    {
      icon: Users,
      value: siteSettings?.happyUsers || "1,000",
      label: "Happy Users",
      color: "from-purple-500 to-violet-600",
      accent: "text-purple-400"
    },
    {
      icon: Star,
      value: siteSettings?.modsCreated || "0",
      label: "Mods Created",
      color: "from-amber-500 to-yellow-600",
      accent: "text-amber-400"
    }
  ];

  // Mouse tracking for background effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-black"
    >
      {/* Interactive background with mouse tracking */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(147, 51, 234, 0.3) 0%, rgba(34, 197, 94, 0.2) 50%, transparent 100%)`,
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating particles */}
      <FloatingParticles count={80} colors={["#a855f7", "#22c55e", "#3b82f6"]} />

      {/* Dynamic gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{
              background: i % 2 === 0 
                ? "radial-gradient(circle, rgba(147, 51, 234, 0.6) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(34, 197, 94, 0.6) 0%, transparent 70%)",
              left: `${20 + (i * 15)}%`,
              top: `${10 + (i * 12)}%`,
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -80, 60, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Left Content */}
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
              style={{ y: y1 }}
            >
              <motion.div 
                className="inline-flex items-center bg-gradient-to-r from-purple-600 via-green-600 to-purple-600 text-white px-4 py-2 text-sm font-medium rounded-full"
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
                <Sparkles className="mr-2 h-4 w-4" />
                Premium BeamNG.drive Marketplace
              </motion.div>
            </motion.div>

            <div style={{ y: y1 }}>
              <TextReveal delay={0.2}>
                <h1 className="text-6xl md:text-7xl font-black mb-6 leading-none">
                  <span className="bg-gradient-to-r from-white via-purple-200 to-green-200 bg-clip-text text-transparent">
                    Drive
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
                    Beyond
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-green-400 via-purple-400 to-white bg-clip-text text-transparent">
                    Reality
                  </span>
                </h1>
              </TextReveal>
            </div>

            <div style={{ y: y2 }}>
              <TextReveal delay={0.4}>
                <p className="text-xl text-slate-300 mb-8 max-w-lg leading-relaxed">
                  Unlock the ultimate BeamNG.drive experience with premium mods that push the boundaries of virtual driving.
                </p>
              </TextReveal>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
              style={{ y: y2 }}
            >
              <Link href="/mods">
                <MagneticButton 
                  variant="primary" 
                  size="lg" 
                  className="px-8 py-4 text-lg font-semibold"
                  strength={0.6}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Explore Mods
                  <ArrowDown className="ml-2 h-5 w-5 rotate-[-90deg]" />
                </MagneticButton>
              </Link>
              <MagneticButton 
                variant="ghost" 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold"
                strength={0.6}
              >
                <Zap className="mr-2 h-5 w-5" />
                Watch Demo
              </MagneticButton>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-3 gap-6"
              style={{ y: y3 }}
            >
              {stats.map((stat, index) => (
                <AnimatedCard
                  key={stat.label}
                  className="text-center p-4"
                  glowColor={stat.color.includes('green') ? 'rgba(34, 197, 94, 0.4)' : 
                             stat.color.includes('purple') ? 'rgba(147, 51, 234, 0.4)' : 
                             'rgba(251, 191, 36, 0.4)'}
                  intensity={1.2}
                >
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className={`h-6 w-6 ${stat.accent}`} />
                  </div>
                  <div className="text-xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-400">
                    {stat.label}
                  </div>
                </AnimatedCard>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Interactive Feature Showcase */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
              style={{ y: y2 }}
            >
              {/* Main Interactive Card */}
              <AnimatedCard 
                className="h-96 w-full"
                glowColor="rgba(147, 51, 234, 0.4)"
                intensity={1.5}
              >
                <div className="relative h-full flex flex-col justify-center items-center p-8 text-center">
                  <motion.div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-green-600 flex items-center justify-center mb-6 shadow-2xl"
                    whileHover={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: 1.1
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Rocket className="h-12 w-12 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Premium Vehicles
                  </h3>
                  <p className="text-slate-300 text-lg">
                    Hand-crafted vehicle mods with stunning detail and performance optimization
                  </p>

                  {/* Floating interactive elements */}
                  <motion.div
                    className="absolute top-4 right-4"
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                  >
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute bottom-4 left-4"
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  >
                    <Zap className="w-5 h-5 text-green-400" />
                  </motion.div>
                </div>
              </AnimatedCard>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-purple-600 rounded-full opacity-60 blur-sm"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-400 to-green-600 rounded-full opacity-60 blur-sm"
              />
            </motion.div>
          </div>
        </div>
      </div>

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
    </section>
  );
}

export default HeroSection;