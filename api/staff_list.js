import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { discordId } = req.query;
  if (!discordId) return res.status(400).json({ success: false, error: 'Missing discordId' });

  // Exemplo de staff mínimo
  const staff = [
    {
      id: '1',
      discordId: '1113945518071107705',
      username: 'SuperAdmin',
      avatar: '',
      role: 'Administrador',
      rank: 10,
      addedAt: new Date().toISOString(),
    },
    {
      id: '2',
      discordId: '222222222222222222',
      username: 'Moderador1',
      avatar: '',
      role: 'Moderador',
      rank: 5,
      addedAt: new Date().toISOString(),
    },
  ];

  res.status(200).json({ success: true, staff });
}
