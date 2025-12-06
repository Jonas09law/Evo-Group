import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { discordId } = req.query;

  if (!discordId) return res.status(400).json({ error: "discordId é obrigatório" });

  try {
    const response = await fetch(
      `https://api.blox.link/v4/public/guilds/${process.env.DISCORD_SERVER_ID}/discord-to-roblox/${discordId}`,
      {
        headers: { Authorization: process.env.BLOXLINK_API_KEY! },
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Bloxlink API error:", err);
    return res.status(500).json({ error: "Erro ao consultar Bloxlink" });
  }
}
