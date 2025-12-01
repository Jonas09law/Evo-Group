import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!id || typeof id !== 'string' || id.length < 5) {
    return res.json({ players: 0, max: 1000 });
  }

  try {
    const response = await fetch(
      `https://games.roblox.com/v1/games/${id}/servers/Public?limit=100`
    );

    const data = await response.json();
    const servers = data.data || [];
    
    const players = servers.reduce((sum: number, srv: any) => sum + (srv.playing || 0), 0);
    const max = servers.reduce((sum: number, srv: any) => sum + (srv.maxPlayers || 0), 0);

    return res.json({ players, max: max || 1000 });
  } catch (error) {
    console.error('Erro no proxy Roblox:', error);
    return res.json({ players: 0, max: 1000 });
  }
}
