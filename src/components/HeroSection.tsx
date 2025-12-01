import { Button } from "@/components/ui/button";
import { Youtube, Twitter, Instagram, MessageCircle } from "lucide-react";
import heroCharacters from "@/assets/hero-characters.png";
import evoLogo from "@/assets/evo-logo.png";

export const HeroSection = () => {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Background with characters */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroCharacters})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-32 text-center">
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Logo Image */}
          <div className="inline-block mb-8">
            <img 
              src={evoLogo} 
              alt="EVO" 
              className="h-32 md:h-48 w-auto mx-auto"
              style={{ 
                filter: 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.6))'
              }}
            />
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground uppercase tracking-[0.3em] font-light">
            O MAIOR GRUPO DE ROBLOX
          </p>

          {/* Main Title */}
          <h2 className="text-5xl md:text-7xl font-bold text-foreground uppercase leading-tight font-rajdhani">
            DA <span className="text-gradient" style={{
              textShadow: '0 0 30px rgba(168, 85, 247, 0.5)'
            }}>AMÉRICA LATINA</span>
          </h2>

          {/* CTA Button */}
          <div className="pt-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl px-16 py-8 rounded-lg glow-primary hover:glow-hover transition-all duration-300 uppercase tracking-wider font-rajdhani"
              onClick={() => {
                const element = document.getElementById("servidores");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              CONECTAR
            </Button>
          </div>

          {/* Social Links */}
          <div className="pt-16">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.4em] mb-6 font-light">
              SIGA NOSSAS REDES SOCIAIS
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://discord.gg/NvfUEmcywQ"
                className="p-3 rounded-full bg-secondary/50 hover:bg-primary/20 border border-border hover:border-primary transition-all duration-300"
              >
                <MessageCircle className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
              </a>
              <a
                href="#"
                className="p-3 rounded-full bg-secondary/50 hover:bg-primary/20 border border-border hover:border-primary transition-all duration-300"
              >
                <Youtube className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
              </a>
              <a
                href="https://www.youtube.com/channel/UC3I1it5xmA-O5UsP2Pj0mmQ"
                className="p-3 rounded-full bg-secondary/50 hover:bg-primary/20 border border-border hover:border-primary transition-all duration-300"
              >
                <Twitter className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
              </a>
              <a
                href="#"
                className="p-3 rounded-full bg-secondary/50 hover:bg-primary/20 border border-border hover:border-primary transition-all duration-300"
              >
                <Instagram className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
