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
    <section className="py-20 relative overflow-hidden">
      {/* Remove individual background - now using unified system */}

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Elevate Your{" "}
            <span className="bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
              BeamNG Drive
            </span>{" "}
            Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of satisfied drivers and experience JSD's premium mods
            today.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {!isAuthenticated && (
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-display font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl hover:shadow-purple-600/30"
                  onClick={handleLogin}
                >
                  <i className="fab fa-discord mr-2"></i> Login with Discord
                </Button>
              </motion.div>
            )}
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="outline"
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white font-display font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-lg border border-green-600/30 hover:border-green-600/70 shadow-lg hover:shadow-xl hover:shadow-green-600/20"
                onClick={handleBrowseMods}
              >
                <i className="fas fa-shopping-bag mr-2"></i> Browse Mods
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
