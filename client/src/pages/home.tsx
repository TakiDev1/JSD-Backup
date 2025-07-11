import HeroSection from "@/components/home/hero-section";
import FeaturedMods from "@/components/home/featured-mods";
import DiscordSection from "@/components/home/discord-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import CallToAction from "@/components/home/call-to-action";
import { SalesBanner, FloatingDealNotification, StickyDealBanner } from "@/components/shared/sales-banner";
import { UrgentPopup } from "@/components/shared/urgent-popup";
import CursorParticles from "@/components/shared/cursor-particles";

import { useEffect, useState } from "react";

const Home = () => {
  const [showFloatingNotification, setShowFloatingNotification] = useState(false);
  const [showUrgentPopup, setShowUrgentPopup] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show floating notifications less frequently - only occasionally
  useEffect(() => {
    // Initial notification after 2 minutes
    const initialTimer = setTimeout(() => {
      if (Math.random() > 0.7) { // Only 30% chance for initial notification
        setShowFloatingNotification(true);
      }
    }, 120000);

    // Set up less frequent recurring notifications every 3-5 minutes
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // Only 20% chance to show
        setShowFloatingNotification(true);
      }
    }, Math.random() * 120000 + 180000); // Every 3-5 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  // Show urgent popup only on weekends after user has been on page for 30 seconds
  useEffect(() => {
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6; // Sunday = 0, Saturday = 6
    
    if (isWeekend) {
      const popupTimer = setTimeout(() => {
        setShowUrgentPopup(true);
      }, 30000);

      return () => clearTimeout(popupTimer);
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Unified seamless background gradient that flows through all sections */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-purple-900/30 to-black"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-green-900/20"></div>
      
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <CursorParticles />
      
      {/* Remove top banner to avoid covering navigation */}
      <div className="pt-16 scroll-smooth relative z-10">
        <HeroSection />
        <FeaturedMods />
        <TestimonialsSection />
        <DiscordSection />
        <CallToAction />
      </div>

      {/* Floating deal notifications */}
      {showFloatingNotification && (
        <FloatingDealNotification 
          onClose={() => setShowFloatingNotification(false)}
        />
      )}

      {/* Sticky bottom banner */}
      <StickyDealBanner />

      {/* Urgent popup */}
      {showUrgentPopup && (
        <UrgentPopup 
          onClose={() => setShowUrgentPopup(false)}
        />
      )}
    </div>
  );
};

export default Home;
