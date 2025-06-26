import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Play, 
  Download, 
  Star, 
  Users, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Car,
  Gauge,
  Trophy
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const HeroSection = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const { data: settings } = useQuery({
    queryKey: ["/api/admin/settings"]
  });

  const features = [
    { 
      icon: Car, 
      title: "Premium Vehicles", 
      description: "Hand-crafted vehicle mods with stunning detail",
      gradient: "from-blue-500 to-purple-600"
    },
    { 
      icon: Gauge, 
      title: "Performance Tuned", 
      description: "Optimized for maximum performance and realism",
      gradient: "from-green-500 to-teal-600"
    },
    { 
      icon: Trophy, 
      title: "Award Winning", 
      description: "Community favorite mods with 5-star ratings",
      gradient: "from-yellow-500 to-orange-600"
    }
  ];

  const stats = [
    { icon: Download, label: "Downloads", value: settings?.totalDownloads || "10K+" },
    { icon: Users, label: "Users", value: settings?.happyUsers || "5K+" },
    { icon: Star, label: "Mods", value: settings?.modsCreated || "50+" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
      
      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Left Content */}
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <Badge className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-medium">
                <Sparkles className="mr-2 h-4 w-4" />
                Premium BeamNG.drive Marketplace
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-7xl font-black mb-6 leading-none"
            >
              <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Drive
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Beyond
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Reality
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-slate-300 mb-8 max-w-lg leading-relaxed"
            >
              Unlock the ultimate BeamNG.drive experience with premium mods that push the boundaries of virtual driving.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link href="/mods">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary-light hover:to-purple-500 text-white font-semibold px-8 py-4 text-lg group shadow-2xl shadow-primary/25">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Explore Mods
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="font-semibold px-8 py-4 text-lg border-2 border-slate-600 hover:border-primary text-white hover:bg-primary/10 backdrop-blur-sm">
                <Zap className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-3 gap-6"
            >
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                  >
                    <IconComponent className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Right Content - Interactive Feature Showcase */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Main Feature Card */}
              <div className="relative h-96 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20"></div>
                
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: currentFeature === index ? 1 : 0,
                        scale: currentFeature === index ? 1 : 0.8
                      }}
                      transition={{ duration: 0.5 }}
                      className={`absolute inset-0 flex flex-col justify-center items-center p-8 text-center ${
                        currentFeature === index ? 'z-10' : 'z-0'
                      }`}
                    >
                      <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-2xl`}>
                        <IconComponent className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-slate-300 text-lg">
                        {feature.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Feature Indicators */}
              <div className="flex justify-center mt-6 space-x-3">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentFeature === index 
                        ? 'bg-primary scale-125' 
                        : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full opacity-60 blur-sm"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-60 blur-sm"
              />
            </motion.div>
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex flex-wrap justify-center items-center gap-8 mt-16 text-slate-400"
        >
          {[
            "Virus Scanned",
            "Quality Tested", 
            "Regular Updates",
            "24/7 Support"
          ].map((feature, index) => (
            <div key={index} className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;