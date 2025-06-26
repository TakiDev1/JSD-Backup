import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Star, Download, ShoppingCart, Eye, TrendingUp, Heart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";

const FeaturedMods = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart, isModInCart } = useCart();
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/mods", { featured: true, limit: 3 }],
    queryFn: ({ queryKey }) => {
      const [url, params] = queryKey;
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
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-800/50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
              Featured <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Mods</span>
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
    <section className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-800/50"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Badge className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 text-white border border-primary/30 px-6 py-2 mb-6 text-sm font-medium backdrop-blur-sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            Community Favorites
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Featured <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">Mods</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Handpicked premium mods that deliver exceptional quality and performance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {mods.map((mod: any, index: number) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 hover:border-primary/50 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/10 overflow-hidden">
                <CardHeader className="p-0 relative">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={mod.thumbnail || "/api/placeholder/400/300"} 
                      alt={mod.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-slate-900/90 backdrop-blur-sm text-white border-0 px-3 py-1">
                        {mod.category}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1">
                        Featured
                      </Badge>
                    </div>

                    {/* Favorite Button */}
                    <button className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-red-500/20 hover:border-red-500 transition-all duration-300 group/heart">
                      <Heart className="h-4 w-4 text-white group-hover/heart:text-red-400 transition-colors" />
                    </button>
                    
                    {/* Bottom Info Bar */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-amber-400 fill-current" />
                            <span className="text-white text-sm font-semibold">4.9</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Download className="h-4 w-4 text-slate-300" />
                            <span className="text-white text-sm font-medium">2.1K</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                          <Clock className="h-3 w-3 text-slate-300" />
                          <span className="text-white text-xs font-medium">Updated 2d ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                    {mod.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {mod.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        ${mod.price}
                      </span>
                      {mod.discountPrice && (
                        <span className="text-sm text-slate-500 line-through">
                          ${mod.discountPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400 text-sm">
                      <Eye className="h-4 w-4" />
                      <span>1.2K</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 flex gap-3">
                  <Link href={`/mods/${mod.id}`} className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-600 hover:border-primary hover:bg-primary/10 text-white transition-all duration-300"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                  <Button 
                    className={`flex-1 transition-all duration-300 ${
                      isModInCart(mod.id) 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25' 
                        : 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary-light hover:to-purple-500 shadow-lg shadow-primary/25'
                    }`}
                    onClick={() => handleAddToCart(mod)}
                    disabled={isModInCart(mod.id)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isModInCart(mod.id) ? 'Added' : 'Add to Cart'}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/mods">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary-light hover:to-purple-500 text-white font-semibold px-8 py-4 text-lg shadow-xl shadow-primary/25 border-0"
            >
              Explore All Mods
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedMods;