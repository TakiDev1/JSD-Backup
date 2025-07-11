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
    <section className="py-20 relative overflow-hidden">
      {/* Remove individual background - now using unified system */}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="order-2 lg:order-1"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-900/30 transform rotate-1 shadow-lg hover:border-purple-600/50 transition-all duration-500 group card-3d relative overflow-hidden"
              whileHover={{ 
                rotate: 0, 
                scale: 1.02,
                y: -10,
                boxShadow: "0 25px 50px rgba(139, 92, 246, 0.3)"
              }}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Floating particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-8 right-8 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                <div className="absolute bottom-12 left-12 w-1 h-1 bg-green-400 rounded-full animate-ping delay-500"></div>
                <div className="absolute top-1/2 right-12 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-700"></div>
              </div>
              
              <motion.div 
                className="flex items-center justify-between mb-6"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center space-x-2">
                  <motion.div 
                    className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ 
                      scale: 1.2, 
                      rotate: 360,
                      boxShadow: "0 0 20px rgba(88, 101, 242, 0.6)"
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <i className="fab fa-discord text-white text-xl"></i>
                  </motion.div>
                  <motion.span 
                    className="text-xl font-display font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-green-400 group-hover:bg-clip-text transition-all duration-300"
                    whileHover={{ x: 3 }}
                  >
                    Discord Login
                  </motion.span>
                </div>
                <div className="flex space-x-2">
                  <motion.div 
                    className="w-3 h-3 bg-red-500 rounded-full"
                    whileHover={{ scale: 1.3 }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  ></motion.div>
                  <motion.div 
                    className="w-3 h-3 bg-yellow-500 rounded-full"
                    whileHover={{ scale: 1.3 }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  ></motion.div>
                  <motion.div 
                    className="w-3 h-3 bg-green-500 rounded-full"
                    whileHover={{ scale: 1.3 }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  ></motion.div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-black/40 p-6 rounded-lg mb-6 border border-purple-900/20 group-hover:border-purple-600/40 transition-all duration-300 relative overflow-hidden"
                whileHover={{ y: -3, scale: 1.01 }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"></div>
                
                <motion.h4 
                  className="text-lg font-display font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-green-400 group-hover:bg-clip-text transition-all duration-300"
                  whileHover={{ x: 2 }}
                >
                  Login with Discord
                </motion.h4>
                <motion.p 
                  className="text-neutral mb-6 group-hover:text-gray-300 transition-colors duration-300"
                  whileHover={{ x: 3 }}
                >
                  Connect your Discord account for a seamless experience. Your Discord roles will sync automatically.
                </motion.p>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    className="w-full bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3c47a3] text-white font-display font-semibold py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-[#5865F2]/30 btn-interactive"
                    onClick={handleLogin}
                  >
                    <motion.i 
                      className="fab fa-discord mr-2"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    ></motion.i> 
                    Continue with Discord
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="text-xs text-neutral text-center group-hover:text-gray-300 transition-colors duration-300"
                whileHover={{ scale: 1.02 }}
              >
                By connecting, you agree to our <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Terms of Service</a> and <a href="#" className="text-green-400 hover:text-green-300 transition-colors">Privacy Policy</a>
              </motion.div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1200 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"></div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="order-1 lg:order-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Join Our <span className="bg-gradient-to-r from-purple-600 to-green-600 bg-clip-text text-transparent">Community</span>
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
              <motion.div 
                className="flex items-start space-x-4 group" 
                variants={itemVariants}
                whileHover={{ x: 10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-600 to-green-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-purple-600/50 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.2, 
                    rotate: 360,
                    boxShadow: "0 0 20px rgba(139, 92, 246, 0.6)"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Check className="h-4 w-4" />
                </motion.div>
                <div>
                  <motion.h4 
                    className="text-white font-display font-semibold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-green-400 group-hover:bg-clip-text transition-all duration-300"
                    whileHover={{ x: 3 }}
                  >
                    One-Click Authentication
                  </motion.h4>
                  <motion.p 
                    className="text-neutral group-hover:text-gray-300 transition-colors duration-300"
                    whileHover={{ x: 5 }}
                  >
                    No need to create another account or remember more passwords.
                  </motion.p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start space-x-4 group" 
                variants={itemVariants}
                whileHover={{ x: 10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-green-600/50 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.2, 
                    rotate: -360,
                    boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Check className="h-4 w-4" />
                </motion.div>
                <div>
                  <motion.h4 
                    className="text-white font-display font-semibold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300"
                    whileHover={{ x: 3 }}
                  >
                    Role Synchronization
                  </motion.h4>
                  <motion.p 
                    className="text-neutral group-hover:text-gray-300 transition-colors duration-300"
                    whileHover={{ x: 5 }}
                  >
                    Your Discord roles sync to unlock special features and access levels.
                  </motion.p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start space-x-4 group" 
                variants={itemVariants}
                whileHover={{ x: 10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-purple-600/50 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.2, 
                    rotate: 180,
                    boxShadow: "0 0 20px rgba(139, 92, 246, 0.6)"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Check className="h-4 w-4" />
                </motion.div>
                <div>
                  <motion.h4 
                    className="text-white font-display font-semibold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300"
                    whileHover={{ x: 3 }}
                  >
                    Instant Notifications
                  </motion.h4>
                  <motion.p 
                    className="text-neutral group-hover:text-gray-300 transition-colors duration-300"
                    whileHover={{ x: 5 }}
                  >
                    Get updates on new mods, releases, and exclusive discounts.
                  </motion.p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start space-x-4 group" 
                variants={itemVariants}
                whileHover={{ x: 10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-green-600/50 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.2, 
                    rotate: -180,
                    boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Check className="h-4 w-4" />
                </motion.div>
                <div>
                  <motion.h4 
                    className="text-white font-display font-semibold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300"
                    whileHover={{ x: 3 }}
                  >
                    Community Access
                  </motion.h4>
                  <motion.p 
                    className="text-neutral group-hover:text-gray-300 transition-colors duration-300"
                    whileHover={{ x: 5 }}
                  >
                    Join the JSD Mods community for support, tips, and to show off your builds.
                  </motion.p>
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
