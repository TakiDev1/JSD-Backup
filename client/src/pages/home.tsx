import HeroSection from "@/components/home/hero-section";
import FeaturedMods from "@/components/home/featured-mods";
import FeatureShowcase from "@/components/home/feature-showcase";
import CategoriesSection from "@/components/home/categories-section";
import DiscordSection from "@/components/home/discord-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import CallToAction from "@/components/home/call-to-action";
import { useEffect } from "react";

const Home = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-16">
      <HeroSection />
      <FeaturedMods />
      <FeatureShowcase />
      <CategoriesSection />
      <DiscordSection />
      <TestimonialsSection />
      <CallToAction />
    </div>
  );
};

export default Home;
