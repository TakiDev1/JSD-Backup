import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Youtube, Instagram, Twitch, MessageCircle, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';

// Import JSD Logo
import jsdLogo from '@assets/JSD_pfp_Transparent.png';

const AboutPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-dark to-dark-lighter">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-primary-light/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        <motion.div
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
          className="flex flex-col items-center justify-center mb-20"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <img 
              src={jsdLogo} 
              alt="JSD Logo" 
              className="w-40 h-40 rounded-full object-cover border-4 border-primary shadow-lg shadow-primary/20" 
            />
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-display font-bold text-white mb-6 text-center">
            About <span className="text-primary">JSD</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-neutral-light text-center max-w-3xl mb-8">
            Pushing the boundaries of BeamNG.drive modding with premium, high-quality vehicle mods that deliver unparalleled realism and performance.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
            <a href="https://www.youtube.com/channel/UCUNX0R4Lqvha7IDDMr09nHg" target="_blank" rel="noopener noreferrer" className="bg-[#FF0000] hover:bg-[#CC0000] text-white px-6 py-3 rounded-full flex items-center transition-colors duration-300">
              <Youtube className="w-5 h-5 mr-2" />
              YouTube
            </a>
            <a href="https://discord.gg/ctXrazHgbz" target="_blank" rel="noopener noreferrer" className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-full flex items-center transition-colors duration-300">
              <MessageCircle className="w-5 h-5 mr-2" />
              Discord
            </a>
            <a href="https://instagram.com/jsd_mods" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 text-white px-6 py-3 rounded-full flex items-center transition-colors duration-300">
              <Instagram className="w-5 h-5 mr-2" />
              Instagram
            </a>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24"
        >
          <motion.div variants={itemVariants} className="order-2 md:order-1">
            <h2 className="text-3xl font-display font-bold text-white mb-6">The JSD Story</h2>
            <p className="text-neutral-light mb-4">
              JSD began as a passion project by a dedicated BeamNG.drive enthusiast who saw the potential to create high-quality, realistic vehicle mods that would enhance the gameplay experience for the entire community.
            </p>
            <p className="text-neutral-light mb-6">
              After years of refining 3D modeling skills and mastering the game's physics engine, JSD has established a reputation for creating some of the most detailed and realistic vehicle mods available for BeamNG.drive.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/mods" className="bg-primary hover:bg-primary-light">
                  Explore Mods
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://www.youtube.com/watch?v=PoRandKLMjU&list=PLptXjUfXaZLknZBG5IVbsN3EL-_aPa8Kp&index=27" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Mod Showcase
                </a>
              </Button>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="order-1 md:order-2 bg-dark-card rounded-xl overflow-hidden shadow-xl shadow-black/20">
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/PoRandKLMjU"
              title="JSD Mod Showcase"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-xl"
            ></iframe>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-24"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-display font-bold text-white mb-8 text-center">
            Why Choose JSD <span className="text-primary">Mods</span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              variants={itemVariants}
              className="bg-dark-card p-8 rounded-xl border border-dark-lighter hover:border-primary/30 transition-colors duration-300"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Premium Quality</h3>
              <p className="text-neutral">
                Every JSD mod is crafted with meticulous attention to detail, delivering exceptional models, textures, and physics that enhance your BeamNG experience.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-dark-card p-8 rounded-xl border border-dark-lighter hover:border-primary/30 transition-colors duration-300"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Performance Optimized</h3>
              <p className="text-neutral">
                JSD mods are optimized for both visual fidelity and game performance, ensuring smooth gameplay even with the most detailed vehicles.
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="bg-dark-card p-8 rounded-xl border border-dark-lighter hover:border-primary/30 transition-colors duration-300"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Regular Updates</h3>
              <p className="text-neutral">
                Subscribe to access all current and future mods, with regular updates and improvements based on community feedback.
              </p>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center"
        >
          <motion.h2 variants={itemVariants} className="text-3xl font-display font-bold text-white mb-8">
            Ready to Enhance Your BeamNG Experience?
          </motion.h2>
          
          <motion.div variants={itemVariants}>
            <Button asChild size="lg" className="bg-primary hover:bg-primary-light text-white px-8 py-6 text-lg font-medium rounded-full">
              <Link href="/mods">
                Explore Our Mods Collection
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;