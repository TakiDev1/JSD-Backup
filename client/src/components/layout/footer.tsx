import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    // Subscription would be handled by a backend API
    toast({
      title: "Subscribed!",
      description: "You've been subscribed to our newsletter.",
    });
    
    setEmail("");
  };

  return (
    <footer className="bg-dark-lighter pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center mb-6">
              <div className="mr-2 text-primary text-3xl">
                <i className="fas fa-car-crash"></i>
              </div>
              <Link href="/" className="text-2xl font-display font-bold tracking-wider text-white">
                JSD<span className="text-primary-light">Mods</span>
              </Link>
            </div>
            <p className="text-neutral mb-6">
              Premium BeamNG drive mods created by JSD, delivering unparalleled quality and performance.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral hover:text-primary transition-colors">
                <i className="fab fa-discord text-xl"></i>
              </a>
              <a href="#" className="text-neutral hover:text-primary transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-neutral hover:text-primary transition-colors">
                <i className="fab fa-youtube text-xl"></i>
              </a>
              <a href="#" className="text-neutral hover:text-primary transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-display font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-neutral hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/mods" className="text-neutral hover:text-primary transition-colors">
                  All Mods
                </Link>
              </li>
              <li>
                <Link href="/mods?category=sports" className="text-neutral hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/mod-locker" className="text-neutral hover:text-primary transition-colors">
                  My Mod Locker
                </Link>
              </li>

              <li>
                <Link href="/about" className="text-neutral hover:text-primary transition-colors">
                  About JSD
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-display font-bold text-white mb-6">Customer Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/help/installation" className="text-neutral hover:text-primary transition-colors">
                  Installation Help
                </Link>
              </li>
              <li>
                <Link href="/help/faq" className="text-neutral hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/help/contact" className="text-neutral hover:text-primary transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/help/refunds" className="text-neutral hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-display font-bold text-white mb-6">Newsletter</h4>
            <p className="text-neutral mb-4">
              Subscribe to get updates on new mods, exclusive discounts, and more.
            </p>
            <form onSubmit={handleSubscribe}>
              <div className="flex mb-3">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 bg-dark border border-dark-card focus:border-primary rounded-r-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" className="bg-primary hover:bg-primary-light text-white rounded-l-none">
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </div>
              <div className="text-xs text-neutral">
                We respect your privacy. Unsubscribe at any time.
              </div>
            </form>
          </div>
        </div>
        
        <div className="border-t border-dark-card pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-neutral text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} JSD Mods. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-neutral text-sm">Payment Methods:</div>
            <i className="fab fa-cc-visa text-neutral text-xl"></i>
            <i className="fab fa-cc-mastercard text-neutral text-xl"></i>
            <i className="fab fa-cc-amex text-neutral text-xl"></i>
            <i className="fab fa-cc-paypal text-neutral text-xl"></i>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
