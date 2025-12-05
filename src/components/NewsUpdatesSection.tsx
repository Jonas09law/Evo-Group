import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updates } from "@/data/updates";

export default function NewsUpdatesSection() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedUpdate, setSelectedUpdate] = useState<typeof updates[0] | null>(null);

  useEffect(() => {
    if (slug) {
      const found = updates.find(u => u.slug === slug);
      if (found) setSelectedUpdate(found);
    } else {
      setSelectedUpdate(null);
    }
  }, [slug]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % updates.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + updates.length) % updates.length);

  const openUpdate = (update: typeof updates[0]) => {
    navigate(`/updates/${update.slug}`);
  };

  const closeUpdate = () => {
    navigate("/");
  };

  const getVisibleCards = () => {
    const visibleCount = Math.min(3, updates.length);
    return Array.from({ length: visibleCount }).map((_, i) => {
      const index = (currentIndex + i) % updates.length;
      return { ...updates[index], uniqueKey: `${index}-${i}` };
    });
  };

  const renderLine = (line: string, idx: number) => {
    if (line.trim() === "") return <div key={idx} className="h-2" />;

    // Título destacado com **
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <h3
          key={idx}
          className="text-xl font-bold text-primary font-rajdhani mt-4 mb-2"
        >
          {line.replace(/\*\*/g, "")}
        </h3>
      );
    }

    return (
      <p
        key={idx}
        className="text-foreground/90 pl-4 py-1 font-rajdhani flex items-start gap-2"
      >
        <span className="text-primary mt-1">•</span>
        <span className="flex-1">{line}</span>
      </p>
    );
  };

  return (
    <>
      <section id="noticias" className="py-24 bg-gradient-hero relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-5xl md:text-6xl font-bold text-gradient font-rajdhani mb-4 uppercase tracking-wider">
              NOTÍCIAS & ATUALIZAÇÕES
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto font-rajdhani">
              Confira o que está acontecendo nas cidades da EVO GROUP
            </p>
          </div>

          <div className="relative max-w-7xl mx-auto">
            {updates.length > 3 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-card/80 hover:bg-card border border-border rounded-full flex items-center justify-center transition-all duration-300 hover:border-primary"
                >
                  <ChevronLeft className="w-6 h-6 text-primary" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-card/80 hover:bg-card border border-border rounded-full flex items-center justify-center transition-all duration-300 hover:border-primary"
                >
                  <ChevronRight className="w-6 h-6 text-primary" />
                </button>
              </>
            )}

            <div className={`grid gap-6 px-4 ${
              updates.length === 1 ? "md:grid-cols-1 max-w-md mx-auto" :
              updates.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" :
              "md:grid-cols-3"
            }`}>
              {getVisibleCards().map((update, idx) => (
                <Card
                  key={update.uniqueKey}
                  onClick={() => openUpdate(update)}
                  className="bg-card border-border overflow-hidden group cursor-pointer transition-all duration-300 hover:border-primary animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 150}ms` }}
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
                    <div className="absolute bottom-4 left-4">
                      <div className="px-4 py-2 bg-background/80 border-b-2 border-primary rounded">
                        <span className="text-primary font-bold text-sm tracking-wider font-rajdhani">{update.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gradient group-hover:text-primary transition-colors font-rajdhani">{update.title}</h3>
                  </div>
                </Card>
              ))}
            </div>

            {updates.length > 3 && (
              <div className="flex justify-center gap-2 mt-8">
                {updates.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "bg-primary w-8" : "bg-muted hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedUpdate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-background via-card to-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button onClick={closeUpdate} className="absolute top-4 right-4 p-2 rounded-full bg-card hover:bg-primary/20 border border-border hover:border-primary transition-all z-10">
              <X className="w-6 h-6 text-foreground" />
            </button>

            <div className="relative h-64 overflow-hidden rounded-t-lg">
              <img
                src={selectedUpdate.image}
                alt={selectedUpdate.title}
                className="w-full h-full object-cover"
              />
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
              {selectedUpdate.contentText?.split("\n").map(renderLine)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
