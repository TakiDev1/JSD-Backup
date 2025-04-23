import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

interface DiscordAuthProps {
  callbackUrl?: string;
  mode?: "card" | "button" | "minimal";
  onSuccess?: () => void;
}

const DiscordAuth = ({ 
  callbackUrl = "/", 
  mode = "card",
  onSuccess
}: DiscordAuthProps) => {
  const { isAuthenticated, user, login } = useAuth();
  const [, navigate] = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && onSuccess) {
      onSuccess();
    }
  }, [isAuthenticated, onSuccess]);

  const handleLogin = () => {
    setIsLoggingIn(true);
    login();
  };

  if (mode === "minimal") {
    return (
      <Button 
        className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
        onClick={handleLogin}
        disabled={isLoggingIn}
      >
        <i className="fab fa-discord mr-2"></i>
        {isLoggingIn ? "Connecting..." : "Login with Discord"}
      </Button>
    );
  }

  if (mode === "button") {
    return (
      <Button 
        className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-display font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center"
        onClick={handleLogin}
        disabled={isLoggingIn}
      >
        <i className="fab fa-discord mr-2"></i>
        {isLoggingIn ? "Connecting..." : "Continue with Discord"}
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-dark-lighter rounded-2xl p-1 border border-dark-card shadow-lg max-w-md w-full mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center">
                <i className="fab fa-discord text-white text-xl"></i>
              </div>
              <CardTitle className="text-xl font-display font-bold text-white">Discord Login</CardTitle>
            </div>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <CardDescription>
            Connect your Discord account for a seamless experience
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-dark-card p-6 rounded-lg">
            <h4 className="text-lg font-display font-bold text-white mb-4">Login Benefits</h4>
            <ul className="space-y-3 text-neutral-light">
              <li className="flex items-start">
                <div className="bg-primary/20 rounded-full p-1 mr-2 mt-0.5">
                  <i className="fas fa-check text-primary text-xs"></i>
                </div>
                <span>Access your purchased mods and downloads</span>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/20 rounded-full p-1 mr-2 mt-0.5">
                  <i className="fas fa-check text-primary text-xs"></i>
                </div>
                <span>Discord roles sync automatically</span>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/20 rounded-full p-1 mr-2 mt-0.5">
                  <i className="fas fa-check text-primary text-xs"></i>
                </div>
                <span>Receive updates and notifications</span>
              </li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-display font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center"
            onClick={handleLogin}
            disabled={isLoggingIn}
          >
            <i className="fab fa-discord mr-2"></i>
            {isLoggingIn ? "Connecting..." : "Continue with Discord"}
          </Button>
          
          <div className="text-xs text-neutral text-center">
            By connecting, you agree to our <a href="#" className="text-primary">Terms of Service</a> and <a href="#" className="text-primary">Privacy Policy</a>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DiscordAuth;
