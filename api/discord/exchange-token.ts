import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const DISCORD_CLIENT_ID = "1399455643265536051";
  const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

  if (!DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
    return res.status(500).json({ error: 'Configuração do servidor Discord ausente.' });
  }

  try {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    });

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      let errorMsg = 'Erro ao trocar code por token';
      if (tokenData.error === 'invalid_grant') errorMsg += ' (Código expirado ou já usado)';
      else if (tokenData.error === 'invalid_client') errorMsg += ' (Client Secret incorreto)';
      else if (tokenData.error === 'redirect_mismatch') errorMsg += ' (Redirect URI não confere)';

      return res.status(401).json({ error: errorMsg, details: tokenData });
    }

    return res.status(200).json(tokenData);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: err });
  }
}
