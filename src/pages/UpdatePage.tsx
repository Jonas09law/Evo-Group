import { useParams } from "react-router-dom";
import { updates } from "@/data/updates";

export default function UpdatePage() {
  const { slug } = useParams();
  const update = updates.find(u => u.slug === slug);

  if (!update) return <p>Atualização não encontrada</p>;

  return (
    <div>
      <h1>{update.title}</h1>
      <p>{update.contentText}</p>
    </div>
  );
}
