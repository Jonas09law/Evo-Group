import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { robloxId } = req.query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=60"); 

  if (req.method === "OPTIONS") return res.status(200).end();
  if (!robloxId || typeof robloxId !== "string" || isNaN(Number(robloxId))) {
    return res.status(400).json({ error: "robloxId inválido" });
  }

  try {
    const response = await fetch("https://users.roblox.com/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: [Number(robloxId)], excludeBannedUsers: false }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Roblox API error:", response.status, text);
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const json = await response.json();
    const user = json.data[0];

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const userData = {
      id: user.id,
      username: user.name,
      displayName: user.displayName,
      created: user.created,
      avatar: `https://www.roblox.com/headshot-thumbnail/image?userId=${user.id}&width=420&height=420&format=png`,
    };

    return res.status(200).json(userData);
  } catch (err: any) {
    console.error("Erro fatal na API Roblox:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
