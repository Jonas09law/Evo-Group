import { Card } from "@/components/ui/card";
import { MessageCircle, Youtube, Twitter, Instagram, Mail } from "lucide-react";

export const ContactSection = () => {
  const socialLinks = [
    { icon: MessageCircle, label: "Discord", href: "https://discord.gg/NvfUEmcywQ", color: "hover:text-[#5865F2]" },
    { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/channel/UC3I1it5xmA-O5UsP2Pj0mmQ", color: "hover:text-[#FF0000]" },
    { icon: Twitter, label: "Twitter", href: "#", color: "hover:text-[#1DA1F2]" },
    { icon: Instagram, label: "Instagram", href: "#", color: "hover:text-[#E4405F]" },
    { icon: Mail, label: "Email", href: "#", color: "hover:text-primary" },
  ];

  return (
    <section id="contato" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-5xl md:text-6xl font-bold text-gradient font-orbitron mb-4">
            ENTRE EM CONTATO
          </h2>
          <p className="text-muted-foreground text-lg">
            Conecte-se conosco através das nossas redes sociais
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border p-12">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {socialLinks.map((social, index) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex flex-col items-center gap-4 group animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-20 h-20 rounded-full border-2 border-border group-hover:border-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:glow-primary">
                    <social.icon className={`h-8 w-8 text-foreground ${social.color} transition-colors duration-300`} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {social.label}
                  </span>
                </a>
              ))}
            </div>
          </Card>

          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              © 2025 & 2026 EVO GROUP. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
