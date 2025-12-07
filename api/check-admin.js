// api/check-admin.js
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const ADMIN_ROLE_ID = '1246102365203988695';

let auditLogsInternal: any[] = []; // logs internos (staff add/remove/update)

// Função para logs internos
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

// Checagem de admin
async function isAdmin(discordId: string) {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/members/${discordId}`,
      { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
    );
    if (!res.ok) return { isAdmin: false, rank: 0, user: null };
    const member = await res.json();
    const hasAdminRole = member.roles?.includes(ADMIN_ROLE_ID) || false;
    return {
      isAdmin: hasAdminRole,
      rank: hasAdminRole ? 10 : 0,
      user: {
        id: member.user.id,
        username: member.user.global_name || member.user.username,
        avatar: member.user.avatar
          ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
          : null
      }
    };
  } catch {
    return { isAdmin: false, rank: 0, user: null };
  }
}

// Pega logs do Discord
async function fetchDiscordAuditLogs(actionType?: number) {
  try {
    let url = `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/audit-logs`;
    if (actionType) url += `?action_type=${actionType}`;
    const res = await fetch(url, { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } });
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { discordId, fetchLogs } = req.query as { discordId?: string, fetchLogs?: string };
  if (!discordId) return res.status(400).json({ success: false, error: 'Missing discordId' });

  const { isAdmin: userIsAdmin, rank, user } = await isAdmin(discordId);

  if (fetchLogs === 'true' && userIsAdmin) {
    const discordLogs = await fetchDiscordAuditLogs();
    const combinedLogs = [...auditLogsInternal, ...discordLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return res.status(200).json({ success: true, logs: combinedLogs });
  }

  addAuditLog('CHECK_ADMIN', discordId, { isAdmin: userIsAdmin, rank });

  return res.status(200).json({
    success: true,
    isAdmin: userIsAdmin,
    rank,
    user
  });
}
