import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Michael R.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "JSD's Hypersonic GTX mod completely transformed my BeamNG experience. The physics are spot-on and the detail is incredible. Worth every penny!"
  },
  {
    name: "Sarah K.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "The AR preview feature is amazing! Being able to see how the mod looks before purchasing saved me from buying something that wouldn't fit my style."
  },
  {
    name: "David T.",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
    rating: 4.5,
    text: "The Discord integration is fantastic. I get notifications when my favorite mods are updated, and the community is super helpful when I have questions."
  }
];

const TestimonialsSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
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

  return (
    <section className="py-20 bg-gradient-to-br from-black via-green-900/20 to-black">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            What Our <span className="bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">Users Say</span>
          </h2>
          <p className="text-neutral mt-3">
            Hear from the BeamNG community about JSD's exceptional mods
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -15, 
                scale: 1.03,
                rotateY: 5,
                rotateX: 3,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="card-3d"
            >
              <Card className="bg-black/50 backdrop-blur-sm p-8 rounded-xl border border-green-900/30 transition-all duration-500 hover:border-purple-600/60 hover:shadow-2xl hover:shadow-purple-600/25 relative overflow-hidden group btn-magnetic">
                {/* Animated background gradient - matching categories scheme */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                  <div className="absolute bottom-6 left-6 w-1 h-1 bg-green-400 rounded-full animate-ping delay-500"></div>
                  <div className="absolute top-1/2 right-6 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-700"></div>
                </div>
                
                <CardContent className="p-0 relative z-10">
                  <motion.div 
                    className="flex justify-between items-start mb-4"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center">
                      <motion.div 
                        className="w-12 h-12 rounded-full overflow-hidden mr-4 ring-2 ring-transparent group-hover:ring-green-500/50 transition-all duration-300"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Avatar>
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback className="bg-gradient-to-br from-green-600 to-purple-600 text-white font-bold">
                            {testimonial.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div>
                        <motion.h4 
                          className="font-display font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300"
                          whileHover={{ x: 2 }}
                        >
                          {testimonial.name}
                        </motion.h4>
                        <motion.div 
                          className="flex items-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              whileHover={{ 
                                scale: 1.3, 
                                rotate: 15,
                                transition: { delay: i * 0.1 }
                              }}
                            >
                              <i 
                                className={`fas ${i < Math.floor(testimonial.rating) ? 'fa-star' : i < testimonial.rating ? 'fa-star-half-alt' : 'fa-star'} text-yellow-400 hover:text-yellow-300 transition-colors duration-200`}
                              ></i>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Quote icon with animation - green theme */}
                    <motion.div 
                      className="text-green-600/30 text-4xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                      whileHover={{ scale: 1.2, rotate: 180 }}
                      initial={{ rotate: 0 }}
                    >
                      <i className="fas fa-quote-right"></i>
                    </motion.div>
                  </motion.div>
                  
                  <motion.p 
                    className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300"
                    whileHover={{ x: 5 }}
                  >
                    {testimonial.text}
                  </motion.p>
                </CardContent>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"></div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
