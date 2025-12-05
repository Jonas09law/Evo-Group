import { useParams } from "react-router-dom";
import { updates } from "@/data/updates";

export default function UpdatePage() {
  const { slug } = useParams<{ slug?: string }>();
  const update = updates.find(u => u.slug === slug);

  if (!update) return <p>Atualização não encontrada</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gradient font-rajdhani mb-4">{update.title}</h1>
      <p className="text-muted-foreground whitespace-pre-line">{update.contentText}</p>
    </div>
  );
}
