import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const updates = [
  {
    date: "28/11/2025",
    title: "UPDATE 2.02",
    slug: "update-2-02-28-11-2025",
    image: "https://media.discordapp.net/attachments/1441545324597608659/1446527913720676464/ATUALIZACAO.png?format=webp",
    category: "PATCH NOTES",
    contentText: `
Alterado logo do fluxos no jogo
Arrumado erro no gtr r34
Arrumado 1.2 MIL erros de um som
Refeito totalmente sistema de footsteps (reduzido lag)
Arrumado radio
Alterado logo do fluxos no menu do jogo
Adicionado npc para fazer tutoriais na praça (em breve novas opções)
Alteracoes no menu do jogo
Adicionado BMW M4
Reestocado dourada no site do jogo
Arrumado alguns scripts
Adicionado tutorial de como resgatar keys`,
  },
  {
    date: "21/11/2025",
    title: "UPDATE 2.01",
    slug: "update-2-01-21-11-2025",
    image: "https://media.discordapp.net/attachments/1441545324597608659/1446527913720676464/ATUALIZACAO.png?format=webp",
    category: "PATCH NOTES",
    contentText: `
Arrumado armário da CHOQUE
Arrumado carro da CHOQUE
Colocado farda da CHOQUE (Temporaria)
Arrumado fabricação da Chave
Arrumado algumas paredes invisíveis 
Adicionado loja de armas (Pode se comprar coletes etc)
Adicionado sistema de radio 
Adicionado nova arma M4A1 RIS
Adicionado nova arma M16A
Adicionado Porte de armas
Arrumado UI mercado
Arrumado coletes (Agr ja n fica imortal)
Arrumado parts não ancoradas 
Novo carro  Lamborghini Galardo
Arrumado fazenda 
Arrumado erro ao fabricar a Hi Power 
Adicionado Turquia
Agora da para comprar tratamentos na farmácia
Mais lixos espalhados pela cidade`,
  },
  {
    date: "20/11/2025",
    title: "MEGA UPDATE",
    slug: "mega-update-20-11-2025",
    image: "https://media.discordapp.net/attachments/1441545324597608659/1446527913720676464/ATUALIZACAO.png?format=webp",
    category: "PATCH NOTES",
    contentText: `
Mapa totalmente refeito
Agora mostra o nick da pessoa quando ela quita do jogo
Arrumado garagem nao abrir
Refeito sistema dos carros (gasolina e vida)
Refeito TODO o sistema de gasolina
Adicionado sistema de atropelamento
Arrumado alguns spykes de lag ao entrar no jogo
Agora ao sair do carro ele freia automaticamente
Adicionado buzina em todos os carros
Adicionado burnout
Adicionado barulho ao ligar o carro 
...`,
  },
];

export { updates };

export default function NewsUpdatesSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % updates.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + updates.length) % updates.length);
  };

  const getVisibleCards = () => {
    const visibleCount = Math.min(3, updates.length);
    const cards = [];

    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % updates.length;
      cards.push({ ...updates[index], uniqueKey: `${index}-${i}` });
    }
    return cards;
  };

  return (
    <section id="noticias" className="py-24">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold">NOTÍCIAS & ATUALIZAÇÕES</h2>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {updates.length > 3 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2"
                aria-label="Previous Slide"
              >
                <ChevronLeft />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2"
                aria-label="Next Slide"
              >
                <ChevronRight />
              </button>
            </>
          )}

          <div className="grid gap-6 px-4 md:grid-cols-3">
            {getVisibleCards().map((update) => (
              <Link key={update.uniqueKey} href={`/updates/${update.slug}`}>
                <Card className="cursor-pointer hover:border-primary transition-all">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={update.image}
                      alt={update.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-primary">{update.date}</p>
                    <h3 className="text-xl font-bold">{update.title}</h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
