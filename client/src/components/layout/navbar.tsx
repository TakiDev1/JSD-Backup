import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { motion } from "framer-motion";
import { Menu, X, Search, ShoppingCart, User, Settings } from "lucide-react";
import jsdLogo from "@/assets/jsd_logo.png";

const Navbar = () => {
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin, login, logout, getUserAvatar } = useAuth();
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/mods", label: "Mods" },
    // Forum removed as requested
    { path: "/mod-locker", label: "Mod Locker", authRequired: true },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isScrolled ? 'bg-dark-lighter bg-opacity-90 backdrop-blur-md' : 'bg-transparent'} transition-all duration-300`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img src={jsdLogo} alt="JSD Logo" className="h-16 w-auto hover:animate-pulse" />
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            !link.authRequired || isAuthenticated ? (
              <Link 
                key={link.path} 
                href={link.path}
                className={`font-display font-medium ${location === link.path ? 'text-primary-light' : 'text-white hover:text-primary-light'} transition-colors`}
              >
                {link.label}
              </Link>
            ) : null
          ))}
          {isAdmin && (
            <Link 
              href="/admin"
              className="font-display font-medium text-white hover:text-primary-light transition-colors"
            >
              Admin
            </Link>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative glow-effect bg-dark-card rounded-full text-neutral hover:text-white transition-colors">
            <Search className="h-5 w-5" />
          </Button>
          
          <Link href="/checkout">
            <Button 
              variant="ghost" 
              size="icon" 
              className="cart-button relative glow-effect bg-dark-card rounded-full text-neutral hover:text-white transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getUserAvatar(user)} alt={user?.username || "User"} />
                    <AvatarFallback className="bg-primary text-white">
                      {user?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="font-medium">{user?.username}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/mod-locker">Mod Locker</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button 
                className="hidden md:flex bg-primary hover:bg-primary-light text-white font-medium transition-colors"
                size="sm"
              >
                <User className="mr-1 h-4 w-4" /> Login
              </Button>
            </Link>
          )}

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                {isMobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-dark-lighter">
              <div className="flex flex-col gap-6 py-6">
                <div className="px-4 py-2">
                  <div className="flex items-center mb-6">
                    <img src={jsdLogo} alt="JSD Logo" className="h-14 w-auto" />
                  </div>
                  <div className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      !link.authRequired || isAuthenticated ? (
                        <Link 
                          key={link.path} 
                          href={link.path}
                          className="font-display font-medium text-lg text-white hover:text-primary-light transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ) : null
                    ))}
                    {isAdmin && (
                      <Link 
                        href="/admin"
                        className="font-display font-medium text-lg text-white hover:text-primary-light transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                  </div>
                </div>
                <div className="border-t border-dark-card pt-6 px-4">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getUserAvatar(user)} alt={user?.username || "User"} />
                          <AvatarFallback className="bg-primary text-white">
                            {user?.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user?.username}</p>
                          <p className="text-sm text-neutral-light">{user?.email}</p>
                        </div>
                      </div>
                      <Button onClick={() => logout()} variant="outline" className="w-full">
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Link href="/login" className="w-full">
                      <Button className="w-full bg-primary hover:bg-primary-light text-white">
                        <User className="mr-2 h-4 w-4" /> Login
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
