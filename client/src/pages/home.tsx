import HeroSection from "@/components/home/hero-section";
import FeaturedMods from "@/components/home/featured-mods";
import CategoriesSection from "@/components/home/categories-section";
import DiscordSection from "@/components/home/discord-section";
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

  // Show floating notifications periodically
  useEffect(() => {
    const showNotification = () => {
      // Random delay between 15-45 seconds
      const delay = Math.random() * 30000 + 15000;
      setTimeout(() => {
        setShowFloatingNotification(true);
      }, delay);
    };

    // Initial notification after 10 seconds
    const initialTimer = setTimeout(showNotification, 10000);

    // Set up recurring notifications every 45-90 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to show
        setShowFloatingNotification(true);
      }
    }, Math.random() * 45000 + 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  // Show urgent popup after user has been on page for 30 seconds
  useEffect(() => {
    const popupTimer = setTimeout(() => {
      setShowUrgentPopup(true);
    }, 30000);

    return () => clearTimeout(popupTimer);
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
