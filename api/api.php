// api/api.php
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const ADMIN_ROLE_ID = "1246102365203988695"; // ← seu cargo de admin

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action || req.body?.action;
  const discordId = req.query.discordId || req.body?.discordId;

  if (action === 'check_admin') {
    if (!discordId) {
      return res.status(400).json({ success: false, error: 'Missing discordId' });
    }

    try {
      const memberRes = await fetch(
        `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/members/${discordId}`,
        { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
      );

      if (!memberRes.ok) {
        return res.status(200).json({ success: true, isAdmin: false, rank: 0 });
      }

      const member = await memberRes.json();
      const isAdmin = Array.isArray(member.roles) && member.roles.includes(ADMIN_ROLE_ID);

      return res.status(200).json({
        success: true,
        isAdmin,
        rank: isAdmin ? 10 : 0,
        user: {
          id: member.user.id,
          username: member.user.global_name || member.user.username,
          avatar: member.user.avatar
            ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
            : null
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(200).json({ success: true, isAdmin: false, rank: 0 });
    }
  }

  // Qualquer outra ação (pra não dar erro)
  return res.status(200).json({ success: true });
}
