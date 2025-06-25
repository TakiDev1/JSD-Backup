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
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingCart, User, Settings, Home, Package } from "lucide-react";
import jsdLogo from "@/assets/jsd_logo.png";

const Navbar = () => {
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin, isPremium, login, logout, getUserAvatar } = useAuth();
  const { count: cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Change navbar style on scroll with more granular control
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
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
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-center pt-4 px-4">
        <motion.div
          className={`
            relative overflow-hidden backdrop-blur-md border border-white/10
            ${isScrolled 
              ? 'bg-black/80 rounded-full shadow-2xl shadow-primary/20' 
              : 'bg-transparent rounded-2xl'
            }
          `}
          animate={{
            width: isScrolled ? "auto" : "100%",
            maxWidth: isScrolled ? "420px" : "1200px",
            borderRadius: isScrolled ? "50px" : "16px",
            padding: isScrolled ? "8px 20px" : "16px 24px",
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.4
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <motion.div
              animate={{
                scale: isScrolled ? 0.8 : 1,
                opacity: isScrolled ? 0.9 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              <Link href="/" className="flex items-center">
                <img 
                  src={jsdLogo} 
                  alt="JSD Logo" 
                  className={`${isScrolled ? 'h-8' : 'h-12'} w-auto transition-all duration-300`}
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <AnimatePresence>
              {!isScrolled && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="hidden md:flex items-center space-x-6"
                >
                  {navLinks.map((link) => (
                    !link.authRequired || isAuthenticated ? (
                      <Link 
                        key={link.path} 
                        href={link.path}
                        className={`font-display font-medium transition-all duration-200 ${
                          location === link.path 
                            ? 'text-primary-light' 
                            : 'text-white/90 hover:text-primary-light hover:scale-105'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ) : null
                  ))}
                  {isAdmin && (
                    <Link 
                      href="/admin"
                      className="font-display font-medium text-white/90 hover:text-primary-light transition-all duration-200 hover:scale-105"
                    >
                      Admin
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Compact Navigation (when scrolled) */}
            <AnimatePresence>
              {isScrolled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:flex items-center space-x-2"
                >
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-white/20">
                      <Home className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/mods">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-white/20">
                      <Package className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Actions Section */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`relative rounded-full transition-all duration-200 ${
                  isScrolled 
                    ? 'h-8 w-8 bg-white/10 hover:bg-white/20' 
                    : 'h-10 w-10 bg-white/10 hover:bg-white/20'
                }`}
              >
                <Search className={`${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </Button>
              
              <Link href="/cart">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`relative rounded-full transition-all duration-200 ${
                    isScrolled 
                      ? 'h-8 w-8 bg-white/10 hover:bg-white/20' 
                      : 'h-10 w-10 bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <ShoppingCart className={`${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  {cartCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full flex items-center justify-center ${
                        isScrolled ? 'h-4 w-4 text-[10px]' : 'h-5 w-5'
                      }`}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Button>
              </Link>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full p-0">
                      <Avatar className={`${isScrolled ? 'h-8 w-8' : 'h-10 w-10'} transition-all duration-200`}>
                        <AvatarImage src={getUserAvatar(user)} alt={user?.username || "User"} />
                        <AvatarFallback className="bg-primary text-white">
                          {user?.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-black/90 backdrop-blur-md border-white/10">
                    <DropdownMenuItem className="font-medium">{user?.username}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mod-locker">Mod Locker</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/subscribe">
                        {isPremium ? 'Subscription Status' : 'Get Subscription'}
                      </Link>
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
                    className={`bg-primary hover:bg-primary-light text-white font-medium transition-all duration-200 ${
                      isScrolled ? 'h-8 px-3 text-sm' : 'h-10 px-4'
                    }`}
                  >
                    {isScrolled ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <>
                        <User className="mr-1 h-4 w-4" /> Login
                      </>
                    )}
                  </Button>
                </Link>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`md:hidden rounded-full ${
                      isScrolled 
                        ? 'h-8 w-8 bg-white/10 hover:bg-white/20' 
                        : 'h-10 w-10 bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {isMobileMenuOpen ? (
                      <X className={`${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
                    ) : (
                      <Menu className={`${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-black/95 backdrop-blur-md border-white/10">
                  <div className="flex flex-col gap-6 py-6">
                    <div className="px-4 py-2">
                      <div className="flex items-center mb-6">
                        <img src={jsdLogo} alt="JSD Logo" className="h-12 w-auto" />
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
                        {isAuthenticated && (
                          <Link 
                            href="/subscribe"
                            className="font-display font-medium text-lg text-white hover:text-primary-light transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {isPremium ? 'Subscription Status' : 'Get Subscription'}
                          </Link>
                        )}
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
                    <div className="border-t border-white/10 pt-6 px-4">
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
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
