import { Card } from "@/components/ui/card";
import { Trophy, DollarSign, Clock, Crown } from "lucide-react";

const factions = [
  { name: "Turquia", rank: 1, server: "Fluxos Roleplay" },
  { name: "Groove", rank: 2, server: "Fluxos Roleplay", icon: "⚡" },
  { name: "Policia Militar", rank: 3, server: "Fluxos Roleplay", icon: "🌟" },
];

const richest = [
  { name: "Marcello2083", rank: 1, money: "R$ 3.245.678.901" },
  { name: "Inverno20778", rank: 2, money: "R$ 2.876.543.210" },
  { name: "Gabrieljocem", rank: 3, money: "R$ 2.543.210.987" },
];

const mostOnline = [
  { name: "N/A", rank: 1, time: "EM BREVE" },
  { name: "N/A", rank: 2, time: "EM BREVE" },
  { name: "N/A", rank: 3, time: "EM BREVE" },
];

const RankCard = ({ 
  title, 
  icon: Icon, 
  data 
}: { 
  title: string; 
  icon: any; 
  data: any[];
}) => (
  <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-6">
    <div className="text-center mb-6">
      <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2 font-light">
        TOP 5
      </p>
      <div className="flex items-center justify-center gap-3">
        <Icon className="h-6 w-6 text-primary" />
        <h3 className="text-3xl font-bold text-gradient font-rajdhani tracking-wider uppercase">
          {title}
        </h3>
      </div>
    </div>

    <div className="space-y-3">
      {data.map((item) => (
        <div
          key={item.name}
          className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
            item.rank === 1 
              ? 'bg-primary/10 border border-primary/30' 
              : 'bg-secondary/30 border border-border/30 hover:border-primary/30'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold font-rajdhani text-lg ${
              item.rank === 1 
                ? 'bg-primary/20 text-primary border border-primary/50' 
                : 'bg-secondary text-foreground/60'
            }`}>
              #{item.rank}
            </div>
            <div>
              <p className="font-bold text-foreground font-rajdhani tracking-wide">
                {item.name}
              </p>
              {item.server && (
                <p className="text-xs text-muted-foreground">{item.server}</p>
              )}
              {item.money && (
                <p className="text-sm text-primary font-medium font-rajdhani">{item.money}</p>
              )}
              {item.time && (
                <p className="text-sm text-primary font-medium font-rajdhani">{item.time}</p>
              )}
            </div>
          </div>
          {item.icon && <span className="text-2xl">{item.icon}</span>}
          {item.rank === 1 && <Crown className="h-5 w-5 text-primary" />}
        </div>
      ))}
    </div>
  </Card>
);

export const RankingSection = () => {
  return (
    <section id="ranking" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          <RankCard title="FACÇÕES" icon={Trophy} data={factions} />
          <RankCard title="MAIS RICOS" icon={DollarSign} data={richest} />
          <RankCard title="ONLINE" icon={Clock} data={mostOnline} />
        </div>
      </div>
    </section>
  );
};
