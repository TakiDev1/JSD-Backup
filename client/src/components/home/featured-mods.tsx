import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, Download, ShoppingCart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const FeaturedMods = () => {
  const { isAuthenticated } = useAuth();
  const { addItem: addToCart, isModInCart } = useCart();
  const { toast } = useToast();
  
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
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in with Discord to add items to your cart.",
      });
      return;
    }
    
    try {
      await addToCart(mod.id);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const formatDownloadCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (isLoading) {
    return (
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
              Featured <span className="gradient-text">Mods</span>
            </h2>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Discover our most popular and cutting-edge BeamNG.drive modifications, handpicked for exceptional quality and performance.
            </p>
          </motion.div>
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
    <section className="relative py-32 overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-green-500/20 rounded-full blur-xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.3, 0.6],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-5xl md:text-6xl font-bold mb-6"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              background: "linear-gradient(90deg, #a855f7, #22c55e, #a855f7)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Featured Mods
          </motion.h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Discover our handpicked selection of premium BeamNG mods
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mods.map((mod: any, index: number) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="perspective-1000"
            >
              <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/20 cursor-pointer">
                {/* Enhanced glow effect */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-green-600/20 rounded-xl opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-500"
                  animate={{
                    background: [
                      "linear-gradient(45deg, rgba(139, 92, 246, 0.2), rgba(34, 197, 94, 0.2))",
                      "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(139, 92, 246, 0.2))",
                      "linear-gradient(225deg, rgba(139, 92, 246, 0.2), rgba(34, 197, 94, 0.2))",
                      "linear-gradient(315deg, rgba(34, 197, 94, 0.2), rgba(139, 92, 246, 0.2))"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                <Link to={`/mods/${mod.id}`}>
                  <CardHeader className="p-0 relative z-10">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        {mod.previewImageUrl ? (
                          <img
                            src={mod.previewImageUrl}
                            alt={mod.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-800/60 to-slate-700/60 flex items-center justify-center">
                            <Eye className="h-12 w-12 text-slate-500" />
                          </div>
                        )}
                      </motion.div>
                      
                      {/* Featured badge */}
                      <motion.div
                        className="absolute top-4 left-4"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Badge className="bg-gradient-to-r from-purple-600 to-green-600 text-white font-semibold px-3 py-1 text-xs border-0">
                          ✨ Featured
                        </Badge>
                      </motion.div>
                      
                      {/* Rating badge */}
                      <motion.div
                        className="absolute top-4 right-4"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full border border-yellow-500/40">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-white text-xs font-medium">
                              {mod.averageRating ? mod.averageRating.toFixed(1) : "4.8"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </CardHeader>
                </Link>

                <CardContent className="p-6 relative z-10">
                  <motion.h3 
                    className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-green-400 group-hover:bg-clip-text transition-all duration-300"
                    whileHover={{ x: 3 }}
                  >
                    {mod.title}
                  </motion.h3>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-slate-800 text-slate-300 border border-slate-600 text-xs px-2 py-1">
                        {mod.category}
                      </Badge>
                      {/* Only show download count if >= 10 */}
                      {mod.downloadCount >= 10 && (
                        <motion.div 
                          className="flex items-center gap-1 text-slate-400"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Download className="h-3 w-3 text-green-400" />
                          <span className="text-xs font-medium">
                            {formatDownloadCount(mod.downloadCount)}
                          </span>
                        </motion.div>
                      )}
                    </div>
                    
                    <motion.div 
                      className="text-right"
                      whileHover={{ scale: 1.05 }}
                    >
                      {mod.discountPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 line-through text-sm">${mod.price}</span>
                          <span className="text-lg font-bold text-green-400">
                            ${mod.discountPrice}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-white">
                          ${mod.price}
                        </span>
                      )}
                    </motion.div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative overflow-hidden"
                  >
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(mod);
                      }}
                      disabled={isModInCart(mod.id)}
                      className={`w-full font-semibold py-3 text-white transition-all duration-300 border-0 ${
                        isModInCart(mod.id) 
                          ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30' 
                          : 'bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 shadow-lg shadow-purple-600/30'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isModInCart(mod.id) ? (
                          <>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Star className="h-4 w-4 fill-current" />
                            </motion.div>
                            Added to Cart
                          </>
                        ) : (
                          <>
                            <motion.div
                              whileHover={{ rotate: 15 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </motion.div>
                            Add to Cart
                          </>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link to="/mods">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white border-0 px-8 py-3 text-lg font-semibold shadow-lg shadow-purple-600/30 transition-all duration-300">
                View All Mods
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedMods;