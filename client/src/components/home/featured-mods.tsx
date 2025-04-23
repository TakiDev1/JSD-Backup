import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useModsList } from "@/hooks/use-mods";
import { useCart } from "@/hooks/use-cart";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedMods = () => {
  const { data: { mods = [] } = {}, isLoading } = useModsList({ featured: true, limit: 3 });
  const { addItem, isModInCart } = useCart();
  
  // Setup card rotation effect
  useEffect(() => {
    const cards = document.querySelectorAll('.card-3d');
    
    const handleMouseMove = (e: MouseEvent, card: Element) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.setAttribute('style', `transform: perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    };
    
    const handleMouseLeave = (card: Element) => {
      card.setAttribute('style', 'transform: perspective(1000px) rotateX(0) rotateY(0)');
    };
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => handleMouseMove(e as MouseEvent, card));
      card.addEventListener('mouseleave', () => handleMouseLeave(card));
    });
    
    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', (e) => handleMouseMove(e as MouseEvent, card));
        card.removeEventListener('mouseleave', () => handleMouseLeave(card));
      });
    };
  }, [data]);
  
  const handleAddToCart = async (modId: number, e: React.MouseEvent) => {
    e.preventDefault();
    await addItem(modId);
  };

  return (
    <section className="py-20 bg-dark-lighter">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
              Featured <span className="text-primary">Mods</span>
            </h2>
            <p className="text-neutral mt-2">Handpicked premium modifications for BeamNG drive</p>
          </div>
          <Link href="/mods" className="hidden md:flex items-center text-primary hover:text-primary-light font-display font-semibold transition-colors">
            View all mods <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [...Array(3)].map((_, index) => (
              <div key={index} className="bg-dark-card rounded-xl overflow-hidden border border-dark-card">
                <Skeleton className="w-full h-56" />
                <div className="p-6 space-y-4">
                  <Skeleton className="w-3/4 h-6" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-full h-4" />
                  <div className="flex items-center mb-4">
                    <Skeleton className="flex-1 h-4" />
                    <div className="flex space-x-1">
                      <Skeleton className="w-16 h-6" />
                      <Skeleton className="w-16 h-6" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="flex-1 h-10" />
                    <Skeleton className="w-10 h-10" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            data?.mods.map((mod) => (
              <motion.div 
                key={mod.id}
                className="card-3d bg-dark-card rounded-xl overflow-hidden border border-dark-card hover:border-primary/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link href={`/mods/${mod.id}`}>
                  <div className="relative">
                    <img 
                      src={mod.thumbnail} 
                      alt={mod.title} 
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-primary text-white text-sm font-semibold py-1 px-3 rounded-full">
                      ${mod.discountPrice?.toFixed(2) || mod.price.toFixed(2)}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-dark bg-opacity-70 text-white text-sm font-semibold py-1 px-3 rounded-md">
                      <i className="fas fa-star text-yellow-400 mr-1"></i> {mod.averageRating?.toFixed(1) || "New"} ({mod.downloadCount})
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-display font-bold text-white mb-2">{mod.title}</h3>
                    <p className="text-neutral text-sm mb-4 line-clamp-2">{mod.description}</p>
                    <div className="flex items-center mb-4">
                      <div className="flex-1">
                        <span className="text-xs text-neutral mr-2">Version:</span>
                        <span className="text-xs text-white">v2.3.1</span>
                      </div>
                      <div className="flex space-x-1">
                        <Badge className="bg-dark text-secondary">{mod.category}</Badge>
                        {mod.tags && mod.tags[0] && (
                          <Badge className="bg-dark text-secondary">{mod.tags[0]}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary-light text-white font-display font-semibold py-2 rounded transition-colors"
                        onClick={(e) => handleAddToCart(mod.id, e)}
                        disabled={isModInCart(mod.id)}
                      >
                        <i className="fas fa-shopping-cart mr-2"></i> 
                        {isModInCart(mod.id) ? "Added to Cart" : "Add to Cart"}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-10 flex items-center justify-center bg-dark-lighter hover:bg-dark text-white font-medium py-2 rounded transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/mods" className="inline-flex items-center text-primary hover:text-primary-light font-display font-semibold transition-colors">
            View all mods <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMods;
