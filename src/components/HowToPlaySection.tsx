import { Card } from "@/components/ui/card";
import { Download, Gamepad2, UserPlus } from "lucide-react";

const steps = [
  {
    icon: Download,
    title: "PASSO 1",
    description: "Entrar no nosso servidor de discord",
  },
  {
    icon: Gamepad2,
    title: "PASSO 2",
    description: "Ter o Roblox instalado - acesse o website oficial e faça o download.",
  },
  {
    icon: UserPlus,
    title: "PASSO 3",
    description: "Faça o login no roblox, vincule o Discord e boa diversão!",
  },
];

export const HowToPlaySection = () => {
  return (
    <section id="como-jogar" className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-5xl md:text-6xl font-bold text-gradient font-orbitron mb-4">
            COMO JOGAR
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Aqui está tudo o que você precisa para começar sua jornada nos servidores da EVO Group.
            Siga os passos abaixo e prepare-se para uma experiência única de roleplay.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="bg-card border-border p-8 text-center hover:border-primary transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <step.icon className="h-10 w-10" />
              </div>

              <h3 className="text-xl font-bold text-gradient font-orbitron mb-4">
                {step.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Está pronto para começar?
          </p>
          <a
            href="#servidores"
            className="inline-block px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg glow-primary hover:glow-hover transition-all duration-300"
          >
            ESCOLHER SERVIDOR
          </a>
        </div>
      </div>
    </section>
  );
};
