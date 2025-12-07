// api/audit-logs.js
const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

let auditLogsInternal: any[] = []; // logs internos (staff add/remove/update)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { discordId } = req.query;
  if (!discordId) return res.status(400).json({ success: false, error: 'Missing discordId' });

  try {
    // logs do Discord
    const discordRes = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/audit-logs`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
    });
    const discordData = discordRes.ok ? await discordRes.json() : { audit_log_entries: [] };
    const discordLogs = discordData.audit_log_entries.map((log: any) => ({
      id: log.id,
      action: log.action_type,
      userId: log.user_id,
      details: log.changes || {},
      timestamp: log.id ? new Date(parseInt(log.id) / 4194304 + 1420070400000).toISOString() : new Date().toISOString(),
      source: 'discord'
    }));

    const combinedLogs = [...auditLogsInternal, ...discordLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return res.status(200).json({ success: true, logs: combinedLogs });
  } catch (err) {
    console.error('Erro fetch audit logs:', err);
    return res.status(500).json({ success: false, logs: [] });
  }
}

// Função para adicionar log interno (usada em outros endpoints)
export function addAuditLog(action: string, userId: string, details: any) {
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
