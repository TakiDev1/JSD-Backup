import { motion } from "framer-motion";
import { MessageCircle, Users, Crown, Zap } from "lucide-react";

const DiscordSection = () => {
  return (
    <section className="py-32 relative overflow-hidden bg-black">
      {/* Simple background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-green-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-green-600 text-white px-4 py-2 text-sm font-medium rounded-full mb-6">
                <MessageCircle className="mr-2 h-4 w-4" />
                Join Our Community
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-purple-200 to-green-200 bg-clip-text text-transparent">
                  Connect with
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-green-400 to-purple-400 bg-clip-text text-transparent">
                  Mod Creators
                </span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Join our vibrant <span className="text-purple-400 font-semibold">Discord community</span> to 
                connect with fellow enthusiasts, get <span className="text-green-400 font-semibold">instant support</span>, 
                and discover the latest mod releases before anyone else.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-6 mb-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                { icon: Users, value: "5K+", label: "Members", color: "purple" },
                { icon: MessageCircle, value: "24/7", label: "Support", color: "green" },
                { icon: Crown, value: "VIP", label: "Access", color: "purple" }
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center p-4 bg-slate-900/40 border border-slate-700/50 rounded-xl backdrop-blur-sm hover:border-slate-600 transition-colors duration-300"
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
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <button className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105">
                <MessageCircle className="mr-2 h-5 w-5 inline" />
                Join Discord Server
                <Zap className="ml-2 h-4 w-4 inline" />
              </button>
            </motion.div>
          </div>

          {/* Right Content - Discord Preview */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="h-96 w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl backdrop-blur-xl hover:border-slate-600 transition-colors duration-300">
                <div className="relative h-full p-8">
                  {/* Discord-style interface */}
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
                      <div className="flex items-start space-x-3">
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
                      </div>

                      <div className="flex items-start space-x-3">
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
                      </div>

                      <div className="flex items-start space-x-3">
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple decorative elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Live Chat
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscordSection;