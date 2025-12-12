import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";

import atualizacao from "@/assets/ATUALIZACAO.png";

const updates = [
    {
    date: "11/12/2025",
    title: "UPDATE 2.06",
    image: atualizacao,
    category: "PATCH NOTES",
    contentText: `
Arrumado erro de spawnar carro quebrado
Arrumado spawn de carros dos caminhoneiros
Varios itens policiais que estavam salvando na table do inventario foram removidos do salvamento`,
  },
  {
    date: "09/12/2025",
    title: "UPDATE 2.05",
    image: atualizacao,
    category: "PATCH NOTES",
    contentText: `
Agora os mecanicos podem pegar 5 kits
Agora quando voce tentar acessar uma garagem que nao tem permissao recebera um aviso
Arrumar spawn de carros dos mecanicos
Arrumado alerta do atm
Refeito efeito de atirar no carro
Arrumado spawn do EB`,
  },
  {
    date: "05/12/2025",
    title: "UPDATE 2.03",
    image: atualizacao,
    category: "PATCH NOTES",
    contentText: `
Sistema de pintar carro (AINDA EM DESENVOLVIMENTO)
Arrumado atm
Adicionado facs de ruas
Novas roupas, incluindo novos modelos e correções de algumas roupas
Sistema de cassino
Arrumado chuva
Ativado o desmanche de veículos
Nova UI prefeitura
Adicionado marcadores para identificar cada lugar
Agora é possível partir vidros
Arrumado varios erros de sons
Adicionado TrenoNatal
Arrumado emprego de caminhoneiro
Adicionado carros de amostra na concessionaria
Arrumado erro do caminhoneiro no console
Alterações no menu do jogo
Arrumado porta da imobiliaria
Trocado lugar de pegar ROTA
Arrumado gui da rota para mobile
DataStore do *INVENTARIO* voltou antiga (Todos os dados salvos pos WIPE perdidos)
Adicionado garagem na Turquia (Dono comprou)
Adicionado farda na Turquia (Dono comprou)
Refeito o sistema de roubo do banco
Arena de pvp
Alguns comandos do admin foram restringidos
Corrigido comandos que dão erro no admin
Algumas texturas arrumadas
Melhorado sistema de amarrar
Arrumado o amarrar via discord
Arrumado alguns erros de animação
Arrumado TabletPrisional
Novo model BMW M4
Arrumado BMW M4
Adicionado FordFusion
Adicionado DodgeDemon
Adicionado Kombi
Adicionado LamboEgoista
Agora ao roubar um carro a policia sera chamada
Arrumado AK47
Arrumado todas as armas
Agora quando atira nos carros eles quebram aos poucos
Agora a data de gasolina e vida salvam
Arrumado Glock S
Arrumada IA2 S
Agora quando o carro quebra tomando tiro sai fogo tambem
Removido grande lag do jogo
Refeito gui das gamepasses
Alterado preco em robux das gamepasses
Agora ao mudar de time muda para as roupas dele
Arrumado bug da tela piscando`,
  },
  {
    date: "28/11/2025",
    title: "UPDATE 2.02",
    image: atualizacao,
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
    image: atualizacao,
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
Novo carro Lamborghini Galardo
Arrumado fazenda
Arrumado erro ao fabricar a Hi Power
Adicionado Turquia
Agora da para comprar tratamentos na farmácia
Mais lixos espalhados pela cidade`,
  },
  {
    date: "20/11/2025",
    title: "MEGA UPDATE",
    image: atualizacao,
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
Agora quando sai do carro ele freia automaticamente
Nova UI dos carros
Agora para ver a hotbar voce ver a hotbar precisa ou abrir o inventario ou apertar TAB
Agora ao spawnar um carro ele aparecera trancado
Arrumado erros no driveseat onde dava pra entrar segurando E mesmo trancado
Agora os plugins e os sistemas dos carros foram unificados finalmente
Removido o m_steer_camera do R do mouse
Agora a foto do menu do jogo voltou a ser a normal
Adicionado chuva normalmente de novo
Aidicionado portoes automaticos em locais do mapa
Arrumado um erro extremamente grave em um module que infelizmente nao posso falar
Refeito UI da concessionária
Refeito script do entrar carro que causava MUITO lag
Agora é possivel usar lockpick mobile
Não da mais para roubar o próprio carro
Nao da mais para equipar lockpicks na safe
Arrumado bug de consguir desespawnar um carro fora da zona se outro ja tiver spawnando
Agora quando o dono do carro sair do jogo e outra pessoar tiver dirigindo ela pula do carro para impedir o bug do a-chassis
Alteracoes na tela dos termos
Terminado emprego de mecanico
Nova farda PC
Nova farda PMSP
Nova farda EB
Nova farda CHOQUE
Nova farda PF
Nova farda PRF
Novo carro PF
Novo carro PMSP
Novo carro ROTA
Nova farda GRR
Nova farda COT
Nova farda ROTA
Novo carro para os mecanicos
Nova UI armarios corps/facs
Arrumado Gari
Arrumado sistema de fabricar armas
Arrumado emprego de fazendeiro
Arrumado sistema de GARI
Nova intro
Arrumado varios bugs no jogo
Arrumado rota
Arrumado mercado
Arrumado chave
Arrumado farda PRF
Arrumado PC
Otimização no jogo`,
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

  // Pega **apenas os 3 updates do slide atual**
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






