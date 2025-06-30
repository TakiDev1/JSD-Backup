import { Link } from "wouter";
import { motion } from "framer-motion";
import { MOD_CATEGORIES } from "@/lib/constants";
import { useCategoryCounts } from "@/hooks/use-mods";
import { Loader2, Car, Map, Wrench, Settings, Gamepad2, Volume2, Monitor, Hammer } from "lucide-react";
import { AnimatedCard } from "../interactive/animated-card";
import { TextReveal } from "../interactive/text-reveal";
import { FloatingParticles } from "../interactive/floating-particles";

const CategoriesSection = () => {
  const { data: categoryCounts = [], isLoading } = useCategoryCounts();
  
  // Icon mapping for categories using consistent purple/green theme
  const categoryIcons = {
    vehicles: Car,
    maps: Map,
    parts: Wrench,
    configs: Settings,
    handling: Gamepad2,
    sounds: Volume2,
    graphics: Monitor,
    utilities: Hammer
  };

  // Color themes alternating between purple and green
  const getThemeColors = (index: number) => {
    if (index % 2 === 0) {
      return {
        gradient: "from-purple-600 to-purple-800",
        glow: "rgba(147, 51, 234, 0.4)",
        accent: "text-purple-400",
        border: "border-purple-500/20"
      };
    } else {
      return {
        gradient: "from-green-600 to-green-800", 
        glow: "rgba(34, 197, 94, 0.4)",
        accent: "text-green-400",
        border: "border-green-500/20"
      };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  // Process categories with their counts
  const categoriesWithCounts = MOD_CATEGORIES.map(category => {
    const countInfo = Array.isArray(categoryCounts) 
      ? categoryCounts.find((c: any) => c && c.id === category.value) 
      : null;
    
    return {
      ...category,
      count: countInfo?.count || 0
    };
  });

  if (isLoading) {
    return (
      <section className="py-32 relative overflow-hidden">
        <FloatingParticles count={40} colors={["#a855f7", "#22c55e"]} />
        
        <div className="container mx-auto px-4 relative z-10">
          <TextReveal>
            <h2 className="text-5xl md:text-6xl font-black text-center text-white mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                Browse Categories
              </span>
            </h2>
          </TextReveal>
          
          <div className="flex items-center justify-center mt-12">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 relative overflow-hidden bg-black">
      <FloatingParticles count={60} colors={["#a855f7", "#22c55e", "#3b82f6"]} />
      
      {/* Dynamic background gradients */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 left-10 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
            x: [0, -120, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <TextReveal delay={0.2}>
            <motion.h2 
              className="text-5xl md:text-7xl font-black mb-6"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                background: "linear-gradient(90deg, #a855f7, #22c55e, #a855f7)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Browse Categories
            </motion.h2>
          </TextReveal>
          
          <TextReveal delay={0.4}>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Explore our <span className="text-purple-400 font-semibold">comprehensive collection</span> of 
              BeamNG.drive mods, carefully organized by <span className="text-green-400 font-semibold">category</span> 
              for easy discovery.
            </p>
          </TextReveal>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categoriesWithCounts.map((category, index) => {
            const IconComponent = categoryIcons[category.value as keyof typeof categoryIcons];
            const theme = getThemeColors(index);
            
            return (
              <motion.div
                key={category.value}
                variants={itemVariants}
              >
                <Link href={`/mods?category=${category.value}`}>
                  <AnimatedCard
                    className="group h-48 cursor-pointer"
                    glowColor={theme.glow}
                    intensity={1.3}
                  >
                    <div className="relative h-full p-6 flex flex-col justify-between">
                      {/* Background gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-20 rounded-xl`} />
                      
                      {/* Icon */}
                      <motion.div
                        className="relative"
                        whileHover={{ 
                          rotate: [0, -10, 10, -5, 0],
                          scale: 1.1
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        
                        {/* Floating sparkles */}
                        <motion.div
                          className="absolute -top-2 -right-2"
                          animate={{
                            rotate: [0, 180, 360],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                          }}
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${theme.gradient} opacity-70`} />
                        </motion.div>
                      </motion.div>

                      {/* Content */}
                      <div className="relative">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-green-400 group-hover:bg-clip-text transition-all duration-300">
                          {category.label}
                        </h3>
                        
                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                          {category.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${theme.accent}`}>
                            {category.count} mods
                          </span>
                          
                          <motion.div
                            className={`px-3 py-1 rounded-full bg-gradient-to-r ${theme.gradient} text-white text-xs font-medium`}
                            whileHover={{ scale: 1.05 }}
                          >
                            Explore
                          </motion.div>
                        </div>
                      </div>

                      {/* Hover effect overlay */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 rounded-xl`}
                        whileHover={{ opacity: 0.1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </AnimatedCard>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;