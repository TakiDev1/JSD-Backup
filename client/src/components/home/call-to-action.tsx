import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const CallToAction = () => {
  const { isAuthenticated, login } = useAuth();
  const [, navigate] = useLocation();

  const handleLogin = () => {
    if (!isAuthenticated) {
      login();
    }
  };

  const handleBrowseMods = () => {
    navigate("/mods");
  };

  return (
    <section className="py-20 bg-primary bg-opacity-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-dark bg-opacity-50"></div>
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-[url('https://images.unsplash.com/photo-1633422158505-e637088bb19d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Elevate Your <span className="text-primary">BeamNG Drive</span> Experience?
          </h2>
          <p className="text-xl text-neutral-light mb-10">
            Join thousands of satisfied drivers and experience JSD's premium mods today.
          </p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {!isAuthenticated && (
              <Button 
                className="bg-primary hover:bg-primary-light text-white font-display font-semibold py-4 px-8 rounded-md transition-colors text-lg"
                onClick={handleLogin}
              >
                <i className="fab fa-discord mr-2"></i> Login with Discord
              </Button>
            )}
            <Button 
              variant="outline"
              className="bg-dark-card hover:bg-dark-lighter text-white font-display font-semibold py-4 px-8 rounded-md transition-colors text-lg border border-primary/30"
              onClick={handleBrowseMods}
            >
              <i className="fas fa-shopping-bag mr-2"></i> Browse Mods
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
