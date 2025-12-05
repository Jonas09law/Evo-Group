import { useParams } from "react-router-dom";
import { updates } from "../components/NewsUpdatesSection";

export default function UpdatePage() {
  const { slug } = useParams();
  const update = updates.find((u) => u.slug === slug);

  if (!update) {
    return (
      <div className="p-20 text-center text-red-500 text-3xl">
        Atualização não encontrada.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <img src={update.image} className="rounded-lg mb-10 w-full" alt={update.title} />

      <p className="text-primary font-bold">{update.date}</p>
      <h1 className="text-4xl font-bold mb-10">{update.title}</h1>

      <div className="space-y-4 text-lg">
        {update.contentText.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}
