import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Download, 
  Glasses, 
  CreditCard, 
  MessageSquare, 
  PlugZap 
} from 'lucide-react';

const FeatureShowcase = () => {
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Create particles effect
    if (!particlesContainerRef.current) return;
    
    const container = particlesContainerRef.current;
    const particleCount = 20;
    
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

  const features = [
    {
      icon: <ShieldCheck className="h-10 w-10" />,
      title: "One-Click Discord Login",
      description: "Securely log in with your Discord account for a seamless experience with role synchronization."
    },
    {
      icon: <Download className="h-10 w-10" />,
      title: "Personal Mod Locker",
      description: "Access all your purchased mods in one place with version tracking and update notifications."
    },
    {
      icon: <Glasses className="h-10 w-10" />,
      title: "AR Preview Technology",
      description: "Preview mods in augmented reality before purchasing to see how they'll look in-game."
    },
    {
      icon: <CreditCard className="h-10 w-10" />,
      title: "Secure Stripe Payments",
      description: "Fast, secure checkout with multiple currency support and saved payment methods."
    },
    {
      icon: <MessageSquare className="h-10 w-10" />,
      title: "Community Forum",
      description: "Connect with other BeamNG enthusiasts to share experiences and get mod support."
    },
    {
      icon: <PlugZap className="h-10 w-10" />,
      title: "Direct Game Integration",
      description: "Install mods directly into your BeamNG drive game with our seamless integration system."
    }
  ];

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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-20 bg-dark relative overflow-hidden">
      <div className="particles-container" ref={particlesContainerRef} id="particles-js-2"></div>
      
      <div className="container mx-auto px-4 z-10 relative">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Revolutionary <span className="text-primary">Features</span>
          </h2>
          <p className="text-neutral mt-3">
            Experience the next level of BeamNG modding with our exclusive platform features
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-dark-lighter p-8 rounded-xl border border-dark-card hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-2"
              variants={itemVariants}
            >
              <div className="text-secondary text-4xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
