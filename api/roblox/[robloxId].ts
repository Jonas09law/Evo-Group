import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { robloxId } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!robloxId || typeof robloxId !== 'string') {
    return res.status(400).json({ error: 'ID do Roblox inválido' });
  }

  try {

    const userResponse = await fetch(`https://users.roblox.com/v1/users/${robloxId}`);
    if (!userResponse.ok) {
      return res.status(userResponse.status).json({ error: 'Erro ao buscar usuário Roblox' });
    }

    const userData = await userResponse.json();
    const robloxUsername = userData.name || `User_${robloxId}`;
    const robloxAvatar = `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxId}&width=150&height=150&format=png`;

    return res.status(200).json({
      id: robloxId,
      username: robloxUsername,
      avatar: robloxAvatar,
    });
  } catch (err) {
    console.error('Erro no endpoint Roblox:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar usuário Roblox' });
  }
}
