import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import EvoLogo from "@/assets/AAAAAA.png";
import musicFile from "@/assets/musicas/EuVouNaSuaCasa.mp3"; 

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const playMusic = () => {
    const audio = new Audio(musicFile);
    audio.play();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      playMusic(); 
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img
              src={EvoLogo}
              alt="EVO Group Logo"
              className="h-10 w-auto object-contain drop-shadow-lg hover:drop-shadow-xl transition-all duration-300"
            />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("inicio")}
              className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
            >
              INÍCIO
            </button>
            <button
              onClick={() => scrollToSection("servidores")}
              className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
            >
              CIDADES
            </button>
            <button
              onClick={() => scrollToSection("ranking")}
              className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
            >
              RANKING
            </button>
            <button
              onClick={() => scrollToSection("como-jogar")}
              className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
            >
              COMO JOGAR
            </button>
            <button
              onClick={() => scrollToSection("contato")}
              className="text-sm text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
            >
              CONTATO
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border/50">
            <button
              onClick={() => scrollToSection("inicio")}
              className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
            >
              INÍCIO
            </button>
            <button
              onClick={() => scrollToSection("servidores")}
              className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
            >
              CIDADES
            </button>
            <button
              onClick={() => scrollToSection("ranking")}
              className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
            >
              RANKING
            </button>
            <button
              onClick={() => scrollToSection("como-jogar")}
              className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
            >
              COMO JOGAR
            </button>
            <button
              onClick={() => scrollToSection("contato")}
              className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-primary transition-colors font-rajdhani font-semibold tracking-wider uppercase"
            >
              CONTATO
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
