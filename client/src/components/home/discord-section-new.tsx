import { motion } from "framer-motion";
import { MessageCircle, Users, Crown, Zap } from "lucide-react";
import { AnimatedCard } from "../interactive/animated-card";
import { MagneticButton } from "../interactive/magnetic-button";
import { TextReveal } from "../interactive/text-reveal";
import { FloatingParticles } from "../interactive/floating-particles";

const DiscordSection = () => {
  return (
    <section className="py-32 relative overflow-hidden bg-black">
      <FloatingParticles count={40} colors={["#a855f7", "#22c55e"]} />
      
      {/* Background effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1.2, 1, 1.3],
            opacity: [0.5, 0.8, 0.4],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <motion.div 
                className="inline-flex items-center bg-gradient-to-r from-purple-600 via-green-600 to-purple-600 text-white px-4 py-2 text-sm font-medium rounded-full mb-6"
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
                <MessageCircle className="mr-2 h-4 w-4" />
                Join Our Community
              </motion.div>
            </motion.div>

            <TextReveal delay={0.2}>
              <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-green-200 bg-clip-text text-transparent">
                  Connect with
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
                  Mod Creators
                </span>
              </h2>
            </TextReveal>

            <TextReveal delay={0.4}>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Join our vibrant <span className="text-purple-400 font-semibold">Discord community</span> to 
                connect with fellow enthusiasts, get <span className="text-green-400 font-semibold">instant support</span>, 
                and discover the latest mod releases before anyone else.
              </p>
            </TextReveal>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-6 mb-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                { icon: Users, value: "5K+", label: "Members", color: "purple" },
                { icon: MessageCircle, value: "24/7", label: "Support", color: "green" },
                { icon: Crown, value: "VIP", label: "Access", color: "purple" }
              ].map((stat, index) => (
                <AnimatedCard
                  key={stat.label}
                  className="text-center p-4"
                  glowColor={stat.color === 'purple' ? 'rgba(147, 51, 234, 0.4)' : 'rgba(34, 197, 94, 0.4)'}
                  intensity={1.2}
                >
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className={`h-6 w-6 ${stat.color === 'purple' ? 'text-purple-400' : 'text-green-400'}`} />
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

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <MagneticButton
                variant="primary"
                size="lg"
                className="px-8 py-4 text-lg font-semibold"
                strength={0.8}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Join Discord Server
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Zap className="w-4 h-4 text-yellow-300" />
                </motion.div>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Right Content - Interactive Discord Preview */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <AnimatedCard
                className="h-96 w-full"
                glowColor="rgba(147, 51, 234, 0.4)"
                intensity={1.5}
              >
                <div className="relative h-full p-8">
                  {/* Discord-style interface mockup */}
                  <div className="bg-slate-800/80 rounded-lg h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-green-600 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">JSD Mods</h3>
                          <p className="text-slate-400 text-sm">5,247 members</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className="text-green-400 text-sm">Online</span>
                      </div>
                    </div>

                    {/* Chat messages */}
                    <div className="flex-1 p-4 space-y-4">
                      <motion.div
                        className="flex items-start space-x-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                          M
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-purple-400 font-semibold text-sm">ModMaker</span>
                            <span className="text-slate-500 text-xs">Today at 2:30 PM</span>
                          </div>
                          <p className="text-slate-300 text-sm">Just released a new supercar pack! 🚗</p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-start space-x-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                      >
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-semibold">
                          D
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-400 font-semibold text-sm">Driver</span>
                            <span className="text-slate-500 text-xs">Today at 2:31 PM</span>
                          </div>
                          <p className="text-slate-300 text-sm">Looks amazing! Downloading now 🔥</p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="flex items-start space-x-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4 }}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                          A
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-400 font-semibold text-sm">Admin</span>
                            <span className="text-slate-500 text-xs">Today at 2:32 PM</span>
                          </div>
                          <p className="text-slate-300 text-sm">Welcome new members! 👋</p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Floating elements */}
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
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-green-400"></div>
                    </motion.div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Floating notification */}
              <motion.div
                className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold"
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                Live Chat
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscordSection;