import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { discordId } = req.query;

  if (!discordId || typeof discordId !== 'string') { 
    return res.status(400).json({ error: "discordId é obrigatório" });
  }

  const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID;
  const BLOXLINK_API_KEY = process.env.BLOXLINK_API_KEY;

  if (!DISCORD_SERVER_ID || !BLOXLINK_API_KEY) {
    console.error("Missing server ID or Bloxlink API Key in environment.");
    return res.status(500).json({ error: "Configuração do servidor Bloxlink ausente." });
  }

  try {
    const response = await fetch(
      `https://api.blox.link/v4/public/guilds/${DISCORD_SERVER_ID}/discord-to-roblox/${discordId}`,
      {
        headers: { Authorization: BLOXLINK_API_KEY },
      }
    );

    const data = await response.json();
    
    // Retorna a resposta do Bloxlink diretamente
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Bloxlink API error:", err);
    return res.status(500).json({ error: "Erro ao consultar Bloxlink" });
  }
}
