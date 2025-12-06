import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { discordId } = req.query;

  const response = await fetch(
    `https://api.blox.link/v4/public/guilds/${process.env.DISCORD_SERVER_ID}/discord-to-roblox/${discordId}`,
    {
      headers: { Authorization: process.env.BLOXLINK_API_KEY! },
    }
  );

  const data = await response.json();
  res.status(response.status).json(data);
}


