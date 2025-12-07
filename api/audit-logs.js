import type { VercelRequest, VercelResponse } from '@vercel/node';

const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

let auditLogsInternal: any[] = []; 

function addAuditLog(action: string, userId: string, details: any) {
  auditLogsInternal.unshift({
    id: Date.now().toString(),
    action,
    userId,
    details,
    timestamp: new Date().toISOString(),
    source: 'internal'
  });
  if (auditLogsInternal.length > 1000) auditLogsInternal = auditLogsInternal.slice(0, 1000);
}

async function fetchDiscordAuditLogs() {
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/audit-logs`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.audit_log_entries.map((log: any) => ({
      id: log.id,
      action: log.action_type,
      userId: log.user_id,
      details: log.changes || {},
      timestamp: log.id ? new Date(parseInt(log.id) / 4194304 + 1420070400000).toISOString() : new Date().toISOString(),
      source: 'discord'
    }));
  } catch (err) {
    console.error('Erro ao buscar logs Discord:', err);
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { discordId, page = '1' } = req.query as { discordId?: string; page?: string };
  if (!discordId) return res.status(400).json({ success: false, error: 'Missing discordId' });

  try {

    const discordLogs = await fetchDiscordAuditLogs();

    const combinedLogs = [...auditLogsInternal, ...discordLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const perPage = 10;
    const currentPage = parseInt(page.toString());
    const paginatedLogs = combinedLogs.slice((currentPage - 1) * perPage, currentPage * perPage);
    const totalPages = Math.ceil(combinedLogs.length / perPage);

    res.status(200).json({
      success: true,
      logs: paginatedLogs,
      totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
}
