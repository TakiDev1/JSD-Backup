import { HeroSection } from "@/components/home/hero-section-new";
import FeaturedMods from "@/components/home/featured-mods-new";
import CategoriesSection from "@/components/home/categories-section-new";
import DiscordSection from "@/components/home/discord-section-new";
import TestimonialsSection from "@/components/home/testimonials-section";
import CallToAction from "@/components/home/call-to-action";
import { SalesBanner, FloatingDealNotification, StickyDealBanner } from "@/components/shared/sales-banner";
import { UrgentPopup } from "@/components/shared/urgent-popup";
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
    <div className="relative min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Remove top banner to avoid covering navigation */}
      <div className="pt-16 scroll-smooth">
        <HeroSection />
        <FeaturedMods />
        <CategoriesSection />
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
