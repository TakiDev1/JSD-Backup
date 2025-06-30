import { Link } from "wouter";
import { TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { InteractiveModCard } from "../interactive/interactive-mod-card";
import { TextReveal } from "../interactive/text-reveal";
import { MagneticButton } from "../interactive/magnetic-button";
import { FloatingParticles } from "../interactive/floating-particles";

const FeaturedMods = () => {
  const { isAuthenticated } = useAuth();
  const { addItem: addToCart, isModInCart } = useCart();
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/mods", { featured: true, limit: 3 }],
    queryFn: ({ queryKey }) => {
      const [url, params] = queryKey as [string, { featured: boolean; limit: number }];
      const searchParams = new URLSearchParams();
      if (params.featured) searchParams.set('featured', 'true');
      if (params.limit) searchParams.set('limit', params.limit.toString());
      return fetch(`${url}?${searchParams}`).then(res => res.json());
    }
  });

  const handleAddToCart = async (mod: any) => {
    if (!isAuthenticated) {
      return;
    }
    await addToCart(mod.id);
  };

  if (isLoading) {
    return (
      <section className="py-32 relative overflow-hidden">
        <FloatingParticles count={30} colors={["#a855f7", "#22c55e"]} />
        
        <div className="container mx-auto px-4 relative z-10">
          <TextReveal>
            <h2 className="text-6xl md:text-7xl font-black text-center text-white mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                Featured Mods
              </span>
            </h2>
          </TextReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800/50 rounded-2xl h-[500px] animate-pulse backdrop-blur-sm"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const mods = data?.mods || [];

  return (
    <section className="relative py-32 overflow-hidden">
      <FloatingParticles count={60} colors={["#a855f7", "#22c55e", "#3b82f6"]} />
      
      {/* Dynamic background with enhanced animations */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.4, 1.2, 1],
            opacity: [0.3, 0.7, 0.5, 0.3],
            x: [0, 50, -30, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1.2, 1, 1.3, 1.2],
            opacity: [0.5, 0.8, 0.4, 0.5],
            x: [0, -60, 40, 0],
            y: [0, 30, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced heading */}
        <motion.div className="text-center mb-20">
          <TextReveal delay={0.2}>
            <motion.h2 
              className="text-6xl md:text-8xl font-black mb-6"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                background: "linear-gradient(90deg, #a855f7, #22c55e, #3b82f6, #a855f7)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Featured Mods
            </motion.h2>
          </TextReveal>
          
          <TextReveal delay={0.4}>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Experience the <span className="text-purple-400 font-semibold">ultimate collection</span> of 
              handpicked BeamNG mods, featuring <span className="text-green-400 font-semibold">cutting-edge</span> vehicles 
              and <span className="text-blue-400 font-semibold">immersive</span> experiences.
            </p>
          </TextReveal>
        </motion.div>

        {/* Interactive mod cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {mods.map((mod: any, index: number) => (
            <InteractiveModCard
              key={mod.id}
              mod={mod}
              onAddToCart={handleAddToCart}
              isInCart={isModInCart(mod.id)}
              index={index}
            />
          ))}
        </div>

        {/* Enhanced CTA button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Link href="/mods">
            <MagneticButton 
              variant="primary" 
              size="lg" 
              className="px-12 py-4 text-xl font-bold relative"
              strength={1.2}
            >
              <TrendingUp className="w-6 h-6 mr-3" />
              Explore All Mods
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </motion.div>
              
              {/* Pulsing ring effect */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(147, 51, 234, 0.7)",
                    "0 0 0 15px rgba(147, 51, 234, 0)",
                    "0 0 0 0 rgba(147, 51, 234, 0)"
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </MagneticButton>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedMods;