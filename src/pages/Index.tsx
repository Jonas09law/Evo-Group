import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { ServersSection } from "@/components/ServersSection";
import NewsUpdatesSection from "@/components/NewsUpdatesSection";
import { RankingSection } from "@/components/RankingSection";
import { HowToPlaySection } from "@/components/HowToPlaySection";
import { ContactSection } from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <ServersSection />
      <RankingSection />
      <HowToPlaySection />
      <NewsUpdatesSection />
      <ContactSection />
    </div>
  );
};

export default Index;
