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
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-black/50 backdrop-blur-sm p-8 rounded-xl border border-purple-900/30 transform hover:-translate-y-2 transition-all duration-300 hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-600/20">
                <CardContent className="p-0">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <Avatar>
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-white">{testimonial.name}</h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <i 
                              key={i} 
                              className={`fas ${i < Math.floor(testimonial.rating) ? 'fa-star' : i < testimonial.rating ? 'fa-star-half-alt' : 'fa-star'} text-yellow-400`}
                            ></i>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-primary text-4xl opacity-20">
                      <i className="fas fa-quote-right"></i>
                    </div>
                  </div>
                  <p className="text-neutral">{testimonial.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
