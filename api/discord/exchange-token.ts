// api/discord/exchange-token.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configura CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
    console.error('⚠️ Discord credentials missing in environment:', {
      DISCORD_CLIENT_ID: !!DISCORD_CLIENT_ID,
      DISCORD_CLIENT_SECRET: !!DISCORD_CLIENT_SECRET,
      DISCORD_REDIRECT_URI: !!DISCORD_REDIRECT_URI,
    });
    return res.status(500).json({ error: 'Configuração do servidor Discord ausente.' });
  }

  try {
    // ⚡️ Garantindo que client_id e client_secret sejam strings
    const params = new URLSearchParams({
      client_id: String(DISCORD_CLIENT_ID),
      client_secret: String(DISCORD_CLIENT_SECRET),
      grant_type: 'authorization_code',
      code,
      redirect_uri: String(DISCORD_REDIRECT_URI),
    });

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('❌ Discord token exchange failed', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        response: tokenData,
      });

      let errorMsg = 'Erro ao trocar code por token';
      if (tokenData.error === 'invalid_grant') {
        errorMsg += ' (Código expirado ou já usado)';
      } else if (tokenData.error === 'invalid_client') {
        errorMsg += ' (Client ID/Secret incorreto)';
      } else if (tokenData.error === 'redirect_mismatch') {
        errorMsg += ' (Redirect URI não confere)';
      }

      return res.status(401).json({ error: errorMsg, details: tokenData });
    }

    console.log('✅ Discord token exchange success', { access_token: tokenData.access_token });

    return res.status(200).json(tokenData);
  } catch (err) {
    console.error('💥 Exchange token exception:', err);
    return res.status(500).json({ error: 'Erro interno no servidor', details: err });
  }
}
