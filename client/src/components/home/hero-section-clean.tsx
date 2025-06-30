import { motion } from "framer-motion";
import { ArrowDown, Download, Users, Star, Zap, Sparkles, Rocket } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export function HeroSection() {
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

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Simple background gradients - no animation */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-purple-600/20 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-green-600/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-black" />
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Left Content */}
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-green-600 text-white px-4 py-2 text-sm font-medium rounded-full">
                <Sparkles className="mr-2 h-4 w-4" />
                Premium BeamNG.drive Marketplace
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-xl text-slate-300 mb-8 max-w-lg leading-relaxed">
                Unlock the ultimate BeamNG.drive experience with premium mods that push the boundaries of virtual driving.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link href="/mods">
                <button className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-green-600 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25">
                  <Rocket className="mr-2 h-5 w-5 inline" />
                  Explore Mods
                  <ArrowDown className="ml-2 h-5 w-5 inline rotate-[-90deg]" />
                </button>
              </Link>
              <button className="group relative overflow-hidden border-2 border-slate-600 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:border-purple-400 hover:bg-purple-400/10">
                <Zap className="mr-2 h-5 w-5 inline" />
                Watch Demo
              </button>
            </motion.div>

            {/* Stats Grid - Simple cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-3 gap-6"
            >
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center p-4 bg-slate-900/40 border border-slate-700/50 rounded-xl backdrop-blur-sm hover:border-slate-600 transition-colors duration-300"
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
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Clean showcase */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              {/* Main showcase card */}
              <div className="h-96 w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl backdrop-blur-xl hover:border-slate-600 transition-colors duration-300">
                <div className="relative h-full flex flex-col justify-center items-center p-8 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-green-600 flex items-center justify-center mb-6 shadow-2xl">
                    <Rocket className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Premium Vehicles
                  </h3>
                  <p className="text-slate-300 text-lg">
                    Hand-crafted vehicle mods with stunning detail and performance optimization
                  </p>
                </div>
              </div>

              {/* Simple decorative elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400/30 to-purple-600/30 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-400/30 to-green-600/30 rounded-full blur-xl" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Simple scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="relative">
          <ArrowDown className="w-8 h-8 text-white/70" />
        </div>
      </motion.div>
    </section>
  );
}

export default HeroSection;