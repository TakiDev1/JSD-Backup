import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { SITE_STATS } from "@/lib/constants";

const HeroSection = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, login } = useAuth();
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Create particles effect
    if (!particlesContainerRef.current) return;
    
    const container = particlesContainerRef.current;
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('absolute', 'rounded-full', 'opacity-30');
      
      // Random properties
      const size = Math.random() * 6 + 1;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const color = Math.random() > 0.5 ? '#7300ff' : '#00e5ff';
      
      // Apply properties
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.backgroundColor = color;
      
      // Animation
      particle.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      
      container.appendChild(particle);
    }
    
    // Cleanup function
    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  const handleExploreMods = () => {
    navigate("/mods");
  };

  const handleWatchShowcase = () => {
    // In a real implementation this would open a video showcase modal
    alert("Video showcase would open here");
  };

  return (
    <section className="relative h-screen flex items-center overflow-hidden" data-section="hero">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dark to-dark/50 z-10"></div>
        {/* Replace with actual video in production */}
        <div className="w-full h-full bg-dark-lighter opacity-50">
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1567818735868-e71b99932e29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-30"></div>
        </div>
      </div>
      
      <div className="particles-container" ref={particlesContainerRef}></div>
      
      <div className="container mx-auto px-4 z-10 mt-16">
        <motion.div 
          className="max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-display font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Elevate Your <span className="text-primary">BeamNG</span> Experience
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-neutral-light mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Unlock premium custom car mods crafted by JSD, the industry's elite BeamNG modder.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button 
              className="bg-primary hover:bg-primary-light text-white font-display font-semibold py-3 px-8 rounded-md transition-all transform hover:scale-105"
              onClick={handleExploreMods}
            >
              <i className="fas fa-car mr-2"></i> Explore Mods
            </Button>
            <Button 
              variant="outline"
              className="bg-dark-card hover:bg-dark-lighter text-white font-display font-semibold py-3 px-8 rounded-md transition-all transform hover:scale-105 border border-primary/30"
              onClick={handleWatchShowcase}
            >
              <i className="fas fa-play mr-2"></i> Watch Showcase
            </Button>
          </motion.div>
          
          <motion.div 
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-secondary mb-1">
                {SITE_STATS.MODS}
              </div>
              <div className="text-neutral">Unique Mods</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-secondary mb-1">
                {SITE_STATS.DOWNLOADS}
              </div>
              <div className="text-neutral">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-secondary mb-1">
                {SITE_STATS.USERS}
              </div>
              <div className="text-neutral">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-secondary mb-1">
                {SITE_STATS.RATING}
              </div>
              <div className="text-neutral">User Rating</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
