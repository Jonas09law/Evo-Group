import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";

import atualizacao from "@/assets/ATUALIZACAO.png";

const updates = [
  {
    date: "05/12/2025",
    title: "UPDATE 2.03",
    image: atualizacao,
    category: "PATCH NOTES",
    contentText: `Sistema de pintar carro *(AINDA EM DESENVOLVIMENTO)* ...`,
  },
  {
    date: "28/11/2025",
    title: "UPDATE 2.02",
    image: atualizacao,
    category: "PATCH NOTES",
    contentText: `Alterado logo do fluxos no jogo ...`,
  },
  {
    date: "21/11/2025",
    title: "UPDATE 2.01",
    image: atualizacao,
    category: "PATCH NOTES",
    contentText: `Arrumado armário da CHOQUE ...`,
  },
  {
    date: "20/11/2025",
    title: "MEGA UPDATE",
    image: atualizacao,
    category: "PATCH NOTES",
    contentText: `Mapa totalmente refeito ...`,
  },
  {
    date: "18/11/2025",
    title: "MINOR PATCH",
    image: atualizacao,
    category: "PATCH NOTES",
    contentText: `Correções menores ...`,
  },
];

export default function NewsUpdatesSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedUpdate, setSelectedUpdate] = useState<typeof updates[0] | null>(null);

  const cardsPerView = 3;
  const totalSlides = Math.ceil(updates.length / cardsPerView);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const getVisibleCards = () => {
    const start = currentSlide * cardsPerView;
    return updates.slice(start, start + cardsPerView);
  };

  return (
    <>
      <section id="noticias" className="py-24 bg-gradient-hero relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gradient font-rajdhani mb-4 uppercase tracking-wider">
              NOTÍCIAS & ATUALIZAÇÕES
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto font-rajdhani">
              Confira o que está acontecendo nas cidades da EVO GROUP
            </p>
          </div>

          <div className="relative max-w-7xl mx-auto">
            {updates.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-card/80 hover:bg-card border border-border rounded-full flex items-center justify-center transition-all duration-300 hover:border-primary disabled:opacity-50"
                >
                  <ChevronLeft className="w-6 h-6 text-primary" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide >= totalSlides - 1}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-card/80 hover:bg-card border border-border rounded-full flex items-center justify-center transition-all duration-300 hover:border-primary disabled:opacity-50"
                >
                  <ChevronRight className="w-6 h-6 text-primary" />
                </button>
              </>
            )}

            <div className="grid gap-6 px-4 md:grid-cols-3">
              {getVisibleCards().map((update) => (
                <Card
                  key={update.date + update.title}
                  onClick={() => setSelectedUpdate(update)}
                  className="bg-card border-border overflow-hidden group cursor-pointer transition-all duration-300 hover:border-primary"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={update.image}
                      alt={update.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-background/60 border border-primary rounded-md">
                      <span className="text-primary text-sm font-bold font-rajdhani">{update.date}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 px-4 py-2 bg-background/80 border-b-2 border-primary rounded">
                      <span className="text-primary font-bold text-sm tracking-wider font-rajdhani">{update.category}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gradient group-hover:text-primary font-rajdhani">
                      {update.title}
                    </h3>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? "bg-primary w-8" : "bg-muted hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedUpdate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-background via-card to-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedUpdate(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-card hover:bg-primary/20 border border-border hover:border-primary transition-all z-10"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>

            <div className="relative h-64 overflow-hidden rounded-t-lg">
              <img src={selectedUpdate.image} alt={selectedUpdate.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-3 py-1 bg-background/60 border border-primary rounded-md">
                    <span className="text-primary text-sm font-bold font-rajdhani">{selectedUpdate.date}</span>
                  </div>
                  <div className="px-4 py-1 bg-background/60 border border-primary rounded-md">
                    <span className="text-primary font-bold text-sm tracking-wider font-rajdhani">{selectedUpdate.category}</span>
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gradient font-rajdhani">{selectedUpdate.title}</h2>
              </div>
            </div>

            <div className="p-8 space-y-4">
              {selectedUpdate.contentText
                .trim()
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((line, idx) => (
                  <p key={idx} className="text-foreground/90 pl-4 py-1 font-rajdhani flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{line}</span>
                  </p>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
