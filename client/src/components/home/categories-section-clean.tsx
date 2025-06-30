import { Link } from "wouter";
import { motion } from "framer-motion";
import { MOD_CATEGORIES } from "@/lib/constants";
import { useCategoryCounts } from "@/hooks/use-mods";
import { Loader2, Car, Map, Wrench, Settings, Gamepad2, Volume2, Monitor, Hammer } from "lucide-react";

const CategoriesSection = () => {
  const { data: categoryCounts = [], isLoading } = useCategoryCounts();
  
  // Icon mapping for categories
  const categoryIcons = {
    vehicles: Car,
    maps: Map,
    parts: Wrench,
    configs: Settings,
    handling: Gamepad2,
    sounds: Volume2,
    graphics: Monitor,
    utilities: Hammer
  };

  // Color themes alternating between purple and green
  const getThemeColors = (index: number) => {
    if (index % 2 === 0) {
      return {
        gradient: "from-purple-600 to-purple-800",
        accent: "text-purple-400",
        border: "border-purple-500/20",
        hover: "hover:border-purple-400"
      };
    } else {
      return {
        gradient: "from-green-600 to-green-800", 
        accent: "text-green-400",
        border: "border-green-500/20",
        hover: "hover:border-green-400"
      };
    }
  };

  // Process categories with their counts
  const categoriesWithCounts = MOD_CATEGORIES.map(category => {
    const countInfo = Array.isArray(categoryCounts) 
      ? categoryCounts.find((c: any) => c && c.id === category.value) 
      : null;
    
    return {
      ...category,
      count: countInfo?.count || 0
    };
  });

  if (isLoading) {
    return (
      <section className="py-32 relative overflow-hidden bg-black">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                Browse Categories
              </span>
            </h2>
          </div>
          
          <div className="flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 relative overflow-hidden bg-black">
      {/* Simple background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            Browse Categories
          </h2>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Explore our <span className="text-purple-400 font-semibold">comprehensive collection</span> of 
            BeamNG.drive mods, carefully organized by <span className="text-green-400 font-semibold">category</span> 
            for easy discovery.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categoriesWithCounts.map((category, index) => {
            const IconComponent = categoryIcons[category.value as keyof typeof categoryIcons] || Car;
            const theme = getThemeColors(index);
            
            return (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/mods?category=${category.value}`}>
                  <div className={`group h-48 cursor-pointer bg-slate-900/60 border ${theme.border} ${theme.hover} rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-slate-900/80`}>
                    <div className="relative h-full p-6 flex flex-col justify-between">
                      {/* Background gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-10 rounded-xl`} />
                      
                      {/* Icon */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                          {category.label}
                        </h3>
                        
                        <p className="text-slate-400 text-sm mb-3">
                          Explore {category.label.toLowerCase()} for BeamNG.drive
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${theme.accent}`}>
                            {category.count} mods
                          </span>
                          
                          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${theme.gradient} text-white text-xs font-medium`}>
                            Explore
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;