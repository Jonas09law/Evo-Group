// api/check-admin.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { discordId } = req.query;
  if (!discordId) {
    return res.status(400).json({ success: false, error: 'Missing discordId' });
  }

  const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID;
  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const ADMIN_ROLE_ID = '1246102365203988695';

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/members/${discordId}`,
      {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
      }
    );

    if (!response.ok) {
      return res.json({ success: true, isAdmin: false, rank: 0 });
    }

    const member = await response.json();
    const isAdmin = member.roles?.includes(ADMIN_ROLE_ID) || false;

    return res.json({
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
    console.error('Erro check-admin:', err);
    return res.json({ success: true, isAdmin: false, rank: 0 });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
