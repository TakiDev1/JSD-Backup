import { Link } from "wouter";
import { motion } from "framer-motion";
import { MOD_CATEGORIES } from "@/lib/constants";
import { useCategoryCounts } from "@/hooks/use-mods";
import { Loader2 } from "lucide-react";

const CategoriesSection = () => {
  // Fetch category counts from API
  const { data: categoryCounts = [], isLoading } = useCategoryCounts();
  
  const categoryImages = {
    vehicles: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    maps: "https://images.unsplash.com/photo-1519440862171-af26cf8c2a85?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    parts: "https://images.unsplash.com/photo-1567818735868-e71b99932e29?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    configs: "https://images.unsplash.com/photo-1581112877497-83f862785136?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    handling: "https://images.unsplash.com/photo-1617397069387-6b10f7c2943c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    sounds: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    graphics: "https://images.unsplash.com/photo-1558979159-2b18a4070a87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    utilities: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  // Process categories with their counts
  const categoriesWithCounts = MOD_CATEGORIES.map(category => {
    // Find count data for this category
    const countInfo = Array.isArray(categoryCounts) 
      ? categoryCounts.find((c: any) => c && c.id === category.value) 
      : null;
    
    // Return category with count information
    return {
      ...category,
      count: countInfo && typeof countInfo.count === 'number' ? countInfo.count : 0
    };
  });

  return (
    <section className="py-20 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Explore by <span className="bg-gradient-to-r from-purple-600 to-green-600 bg-clip-text text-transparent">Category</span>
          </h2>
          <p className="text-neutral mt-3">
            Find the perfect mods for your driving style and preferences
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {categoriesWithCounts.slice(0, 4).map((category) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/mods?category=${category.value}`} className="group relative h-56 rounded-xl overflow-hidden block">
                  <img 
                    src={categoryImages[category.value as keyof typeof categoryImages]} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-900/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-display font-bold text-white mb-1">
                      {category.name}
                    </h3>
                    <p className="text-neutral-light text-sm">
                      <span className="text-secondary">{category.count}</span> mods available
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/mods" className="inline-flex items-center text-primary hover:text-primary-light font-display font-semibold transition-colors">
            View all categories <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
