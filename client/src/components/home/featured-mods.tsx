import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, Download, ShoppingCart, Eye, Heart } from "lucide-react";
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
      <section className="py-32 relative overflow-hidden bg-gradient-to-br from-black via-purple-900/20 to-black">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-40 h-40 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
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
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Background effects matching hero */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.15),transparent_70%)]" />
      
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
                y: -20,
                scale: 1.05,
                rotateY: 5,
                rotateX: 5,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              className="perspective-1000"
            >
              <Link to={`/mod/${mod.id}`}>
                <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 hover:border-slate-600 transition-all duration-700 backdrop-blur-xl shadow-2xl hover:shadow-slate-800/50 cursor-pointer">
                {/* Subtle dark glow effect */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-700"
                  animate={{
                    background: [
                      "linear-gradient(45deg, #475569, #374151)",
                      "linear-gradient(135deg, #374151, #475569)",
                      "linear-gradient(225deg, #475569, #374151)",
                      "linear-gradient(315deg, #374151, #475569)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Shimmer overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-300/5 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
                
                <CardHeader className="p-0 relative z-10">
                  <div className="relative aspect-video overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {mod.previewImageUrl ? (
                        <img
                          src={mod.previewImageUrl}
                          alt={mod.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/60 to-slate-700/60">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          >
                            <Eye className="h-16 w-16 text-slate-400" />
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                    
                    {/* Interactive badges */}
                    <motion.div
                      className="absolute top-4 left-4"
                      whileHover={{ scale: 1.15, rotate: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="bg-slate-800/90 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg border border-slate-600/50">
                        <span className="text-slate-200 text-sm font-bold tracking-wide">✨ Featured</span>
                      </div>
                    </motion.div>
                    
                    {/* Interactive rating */}
                    <motion.div
                      className="absolute top-4 right-4"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <div className="bg-black/80 backdrop-blur-md px-3 py-2 rounded-full border border-yellow-500/40 shadow-lg">
                        <div className="flex items-center gap-1">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          </motion.div>
                          <span className="text-white text-sm font-semibold">4.9</span>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Interactive heart button */}
                    <motion.button
                      className="absolute bottom-4 right-4 w-12 h-12 bg-black/70 backdrop-blur-md rounded-full border border-red-500/30 flex items-center justify-center group/heart"
                      whileHover={{ scale: 1.3, rotate: 15 }}
                      whileTap={{ scale: 0.8 }}
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(239, 68, 68, 0.4)",
                          "0 0 0 10px rgba(239, 68, 68, 0)",
                          "0 0 0 0 rgba(239, 68, 68, 0)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, -10, 10, 0]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Heart className="h-5 w-5 text-red-400 group-hover/heart:fill-current transition-all duration-300" />
                      </motion.div>
                    </motion.button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 bg-gradient-to-br from-black/80 via-purple-900/10 to-green-900/10 backdrop-blur-xl relative z-10">
                  <motion.h3 
                    className="text-2xl font-bold mb-3 text-white group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-green-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500"
                    whileHover={{ scale: 1.05, x: 5 }}
                    animate={{
                      textShadow: [
                        "0 0 10px rgba(139, 92, 246, 0.3)",
                        "0 0 20px rgba(236, 72, 153, 0.4)",
                        "0 0 10px rgba(34, 197, 94, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {mod.title}
                  </motion.h3>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Badge className="bg-gradient-to-r from-purple-500/30 to-green-500/30 text-white border border-purple-500/50 text-xs px-3 py-1 backdrop-blur-sm">
                          {mod.category}
                        </Badge>
                      </motion.div>
                      <motion.div 
                        className="flex items-center gap-1 text-slate-300"
                        whileHover={{ scale: 1.1 }}
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Download className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium">2.3k</span>
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      className="text-right"
                      whileHover={{ scale: 1.1, rotate: -2 }}
                    >
                      {mod.discountPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 line-through text-sm">${mod.price}</span>
                          <motion.span 
                            className="text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-300 bg-clip-text text-transparent"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            ${mod.discountPrice}
                          </motion.span>
                        </div>
                      ) : (
                        <motion.span 
                          className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-green-200 bg-clip-text text-transparent"
                          animate={{ scale: [1, 1.03, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          ${mod.price}
                        </motion.span>
                      )}
                    </motion.div>
                  </div>
                  
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 30px rgba(139, 92, 246, 0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(mod);
                      }}
                      disabled={isModInCart(mod.id)}
                      className={`w-full relative overflow-hidden border-0 font-semibold py-3 text-white transition-all duration-500 ${
                        isModInCart(mod.id) 
                          ? 'bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/40' 
                          : 'bg-slate-950 hover:bg-slate-900 shadow-lg shadow-black/40'
                      }`}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent -skew-x-12"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "200%" }}
                        transition={{ duration: 0.8 }}
                      />
                      <div className="relative flex items-center justify-center gap-2">
                        {isModInCart(mod.id) ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Star className="h-4 w-4 fill-current" />
                            </motion.div>
                            "Added to Cart"
                          </>
                        ) : (
                          <>
                            <motion.div
                              whileHover={{ rotate: 15, scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </motion.div>
                            "Add to Cart"
                          </>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
              </Link>
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
              <Button className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-slate-800/40 transition-all duration-300">
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