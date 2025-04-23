import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Check } from "lucide-react";

const DiscordSection = () => {
  const { isAuthenticated, login } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, rotate: -2, y: 20 },
    visible: { 
      opacity: 1, 
      rotate: 1, 
      y: 0,
      transition: { duration: 0.7, delay: 0.5 }
    }
  };

  const handleLogin = () => {
    if (!isAuthenticated) {
      login();
    }
  };

  return (
    <section className="py-20 bg-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-[url('https://images.unsplash.com/photo-1629429407759-12f41a77f560?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="order-2 lg:order-1"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="bg-dark-lighter rounded-2xl p-8 border border-dark-card transform rotate-1 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center">
                    <i className="fab fa-discord text-white text-xl"></i>
                  </div>
                  <span className="text-xl font-display font-bold text-white">Discord Login</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-dark-card p-6 rounded-lg mb-6">
                <h4 className="text-lg font-display font-bold text-white mb-4">Login with Discord</h4>
                <p className="text-neutral mb-6">Connect your Discord account for a seamless experience. Your Discord roles will sync automatically.</p>
                
                <Button 
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-display font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center"
                  onClick={handleLogin}
                >
                  <i className="fab fa-discord mr-2"></i> Continue with Discord
                </Button>
              </div>
              
              <div className="text-xs text-neutral text-center">
                By connecting, you agree to our <a href="#" className="text-primary">Terms of Service</a> and <a href="#" className="text-primary">Privacy Policy</a>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="order-1 lg:order-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Join Our <span className="text-primary">Community</span>
            </h2>
            <p className="text-neutral-light text-lg mb-8">
              Connect your Discord account for a seamless experience with exclusive benefits:
            </p>
            
            <motion.div 
              className="space-y-5"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div className="flex items-start space-x-4" variants={itemVariants}>
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-white font-display font-semibold">One-Click Authentication</h4>
                  <p className="text-neutral">No need to create another account or remember more passwords.</p>
                </div>
              </motion.div>
              
              <motion.div className="flex items-start space-x-4" variants={itemVariants}>
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-white font-display font-semibold">Role Synchronization</h4>
                  <p className="text-neutral">Your Discord roles sync to unlock special features and access levels.</p>
                </div>
              </motion.div>
              
              <motion.div className="flex items-start space-x-4" variants={itemVariants}>
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-white font-display font-semibold">Instant Notifications</h4>
                  <p className="text-neutral">Get updates on new mods, releases, and exclusive discounts.</p>
                </div>
              </motion.div>
              
              <motion.div className="flex items-start space-x-4" variants={itemVariants}>
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-white font-display font-semibold">Community Access</h4>
                  <p className="text-neutral">Join the JSD Mods community for support, tips, and to show off your builds.</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DiscordSection;
