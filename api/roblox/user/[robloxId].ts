import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { robloxId } = req.query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!robloxId || typeof robloxId !== "string") {
    return res.status(400).json({ error: "Parâmetro robloxId inválido" });
  }

  try {
    const response = await fetch(`https://users.roblox.com/v1/users/${robloxId}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Usuário Roblox não encontrado" });
    }

    const data = await response.json();

    const userData = {
      id: data.id,
      username: data.name,
      displayName: data.displayName,
      avatar: `https://www.roblox.com/headshot-thumbnail/image?userId=${data.id}&width=150&height=150&format=png`,
      created: data.created,
    };

    return res.status(200).json(userData);
  } catch (err) {
    console.error("Erro ao buscar usuário Roblox:", err);
    return res.status(500).json({ error: "Erro interno ao consultar Roblox" });
  }
}
