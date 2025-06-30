import { Link } from "wouter";
import { TrendingUp, Eye, ShoppingCart, Star, Download, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";

const FeaturedMods = () => {
  const { isAuthenticated } = useAuth();
  const { addItem: addToCart, isModInCart } = useCart();
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/mods", { featured: true, limit: 3 }],
    queryFn: ({ queryKey }) => {
      const [url, params] = queryKey as [string, { featured: boolean; limit: number }];
      const searchParams = new URLSearchParams();
      if (params.featured) searchParams.set('featured', 'true');
      if (params.limit) searchParams.set('limit', params.limit.toString());
      return fetch(`${url}?${searchParams}`).then(res => res.json());
    }
  });

  const handleAddToCart = async (mod: any) => {
    if (!isAuthenticated) {
      return;
    }
    await addToCart(mod.id);
  };

  if (isLoading) {
    return (
      <section className="py-32 relative overflow-hidden bg-black">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                Featured Mods
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800/50 rounded-2xl h-[500px] animate-pulse backdrop-blur-sm"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const mods = data?.mods || [];

  return (
    <section className="relative py-32 overflow-hidden bg-black">
      {/* Simple background gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-600/10 rounded-full blur-3xl" />
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
            Featured Mods
          </h2>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Experience the <span className="text-purple-400 font-semibold">ultimate collection</span> of 
            handpicked BeamNG mods, featuring <span className="text-green-400 font-semibold">cutting-edge</span> vehicles 
            and <span className="text-blue-400 font-semibold">immersive</span> experiences.
          </p>
        </motion.div>

        {/* Mod cards - clean design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {mods.map((mod: any, index: number) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-slate-600 hover:bg-slate-900/80 transition-all duration-300">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={mod.thumbnail || "/api/placeholder/400/300"} 
                    alt={mod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-slate-900/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                      {mod.category}
                    </span>
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full">
                      Featured
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-white">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-amber-400 fill-current" />
                        <span className="text-sm font-semibold">4.9</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span className="text-sm">2.1K</span>
                      </div>
                    </div>
                    
                    <button className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500/20 transition-colors">
                      <Heart className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {mod.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-green-400">
                      ${mod.price}
                    </span>
                    <div className="flex items-center text-slate-400 text-sm">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>1.2K</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link href={`/mods/${mod.id}`} className="flex-1">
                      <button className="w-full border border-slate-600 hover:border-purple-400 hover:bg-purple-400/10 text-white py-2 px-4 rounded-lg transition-all duration-300">
                        <Eye className="mr-2 h-4 w-4 inline" />
                        View Details
                      </button>
                    </Link>
                    <button 
                      className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${
                        isModInCart(mod.id) 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white'
                      }`}
                      onClick={() => handleAddToCart(mod)}
                      disabled={isModInCart(mod.id)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4 inline" />
                      {isModInCart(mod.id) ? 'Added' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Link href="/mods">
            <button className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-300 hover:scale-105">
              <TrendingUp className="mr-2 h-5 w-5 inline" />
              Explore All Mods
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedMods;