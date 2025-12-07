import type { VercelRequest, VercelResponse } from '@vercel/node';

const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { discordId } = req.query;
  
  if (!discordId) {
    return res.status(400).json({ success: false, error: 'Missing discordId' });
  }

  try {

    const guildResponse = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}?with_counts=true`,
      {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
      }
    );

    let stats = {
      totalMembers: 0,
      onlineMembers: 0,
      staffOnline: 0,
      totalStaff: 0,
      recentLogs: 0
    };

    if (guildResponse.ok) {
      const guild = await guildResponse.json();
      stats.totalMembers = guild.approximate_member_count || 0;
      stats.onlineMembers = guild.approximate_presence_count || 0;
      
      stats.staffOnline = Math.floor(stats.onlineMembers * 0.1);
      stats.totalStaff = 5; 
    }

    return res.status(200).json({
      success: true,
      stats
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar estatísticas' 
    });
  }
}
