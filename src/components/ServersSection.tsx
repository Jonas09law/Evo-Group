import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { useState } from "react";
import characterGta from "@/assets/character-gta.png";
import { useRobloxStatus } from "@/hooks/useRobloxStatus";

import LogoFluxos from "@/assets/logos/fluxos.png";
import LogoEvo from "@/assets/logos/evogroup.png";
//import LogoEvoBrasil from "@/assets/logos/evogroup.png";
//import LogoEvoEvolution from "@/assets/logos/evogroup.png";

const servers = [
  {
    name: "Fluxos Roleplay",
    logo: LogoFluxos,
    description: "Construa seu império do zero: do entregador ao magnata, aqui cada trabalho importa.",
    robloxServerId: "112408194066110",
  },
  {
    name: "EVO ROLEPLAY",
    logo: LogoEvo,
    description: "Experiência brasileira autêntica com economia realista e facções únicas.",
    robloxServerId: null,
  },
  {
    name: "EVO VALLEY",
    logo: LogoEvo,
    description: "Servidor premium com conteúdo exclusivo e eventos semanais imperdíveis.",
    robloxServerId: null,
  },
];

export const ServersSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentServer = servers[currentIndex];
  const robloxStatus = useRobloxStatus(currentServer.robloxServerId ?? null);

  const nextServer = () => setCurrentIndex((prev) => (prev + 1) % servers.length);
  const prevServer = () => setCurrentIndex((prev) => (prev - 1 + servers.length) % servers.length);

  return (
    <section id="servidores" className="py-24 bg-gradient-hero relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground uppercase tracking-[0.3em] mb-2 font-light">
            NOSSAS CIDADES
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground font-rajdhani tracking-wider mb-4">
            NOSSAS <span className="text-gradient">CIDADES</span>
          </h2>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Card do servidor */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-8 space-y-6">
              <div className="flex items-center gap-6">
                {/* LOGO EM IMAGEM */}
                <img
                  src={currentServer.logo}
                  alt={`${currentServer.name} logo`}
                  className="w-24 h-24 object-contain drop-shadow-2xl"
                />

                <div>
                  <h3 className="text-3xl font-bold text-gradient font-rajdhani flex items-center gap-3">
                    {currentServer.name}
                    <Flame className="h-8 w-8 text-orange-500" />
                  </h3>
                </div>
              </div>

              <p className="text-foreground/80 text-base leading-relaxed mt-4">
                {currentServer.description}
              </p>

              <div className="flex items-center gap-3 text-foreground py-2">
                <Users className="h-5 w-5 text-primary" />
{currentServer.robloxServerId ? (
                  <span className="font-bold font-rajdhani text-lg tracking-wider">
                    {robloxStatus.loading ? (
                      "CARREGANDO..."
                    ) : robloxStatus.error ? (
                      <span className="text-red-500">OFFLINE NO MOMENTO</span>
                    ) : robloxStatus.players === 0 ? (
                      <span className="text-red-500">OFFLINE</span>
                    ) : (
                      <span className="text-green-400 font-bold">
                        {robloxStatus.players} / {robloxStatus.max} ONLINE
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="font-bold font-rajdhani text-lg tracking-wider text-orange-400">
                    SERVIDOR EM BREVE
                  </span>
                )}
              </div>

<Button
  onClick={() => {
    if (currentServer.robloxServerId) {

      window.location.href = `roblox://placeId=${currentServer.robloxServerId}`;
    } else {

      alert("Este servidor ainda está em desenvolvimento! Fique ligado no Discord!");

      // window.open("https://discord.gg/seu-link", "_blank");
    }
  }}
  disabled={!currentServer.robloxServerId}
  className={`w-full font-bold py-6 rounded-lg glow-primary transition-all duration-300 uppercase tracking-wider font-rajdhani text-base ${
    currentServer.robloxServerId
      ? "bg-primary hover:bg-primary/90 cursor-pointer"
      : "bg-orange-600/80 hover:bg-orange-600 cursor-not-allowed opacity-80"
  }`}
>
  {currentServer.robloxServerId ? "CONECTAR AO SERVIDOR" : "EM BREVE"}
</Button>
            </Card>

            {/* Personagem */}
            <div className="relative h-[500px] flex items-center justify-center">
              <img
                src={characterGta}
                alt="Personagem"
                className="h-full w-auto object-contain drop-shadow-2xl"
                style={{ filter: "drop-shadow(0 0 40px rgba(168, 85, 247, 0.4))" }}
              />
            </div>
          </div>

          {/* Navegação */}
          <div className="flex items-center justify-center gap-8 mt-10">
            <button
              onClick={prevServer}
              className="p-4 rounded-full bg-secondary/50 hover:bg-primary/20 border border-border hover:border-primary transition-all"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>

            <div className="flex gap-3">
              {servers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "w-12 bg-primary" : "w-3 bg-border hover:bg-primary/60"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextServer}
              className="p-4 rounded-full bg-secondary/50 hover:bg-primary/20 border border-border hover:border-primary transition-all"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
