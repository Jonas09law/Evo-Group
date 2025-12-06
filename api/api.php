// api/api.php
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const SUPER_ADMIN_DISCORD_ID = "1113945518071107705";

// ADMINS FIXOS (funcionam SEMPRE, mesmo com cold start do Vercel)
const FIXED_ADMINS: Record<string, number> = {
  "1113945518071107705": 10, // ← você (fundador)
  // Adicione mais IDs aqui se quiser outros admins permanentes
  // "123456789012345678": 9,
};

// Staff em memória (continua funcionando enquanto o servidor estiver quente)
let staffMembers: any[] = [];
let auditLogs: any[] = [];

async function isAdmin(discordId: string): Promise<{ isAdmin: boolean; rank: number }> {
  if (discordId === SUPER_ADMIN_DISCORD_ID) return { isAdmin: true, rank: 10 };
  if (FIXED_ADMINS[discordId] !== undefined) return { isAdmin: true, rank: FIXED_ADMINS[discordId] };

  const staff = staffMembers.find(s => s.discordId === discordId);
  if (staff) return { isAdmin: true, rank: staff.rank || 5 };

  return { isAdmin: false, rank: 0 };
}

async function getDiscordUser(discordId: string) {
  try {
    const res = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
    });
    if (!res.ok) return null;
    const user = await res.json();
    return {
      id: user.id,
      username: user.global_name || user.username,
      avatar: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.global_name || user.username)}&background=5865F2&color=fff`
    };
  } catch {
    return null;
  }
}

async function fetchDiscordAuditLogs(actionType?: string) {
  try {
    const url = actionType
      ? `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/audit-logs?action_type=${actionType}&limit=50`
      : `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/audit-logs?limit=50`;

    const res = await fetch(url, { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.audit_log_entries || [];
  } catch {
    return [];
  }
}

function addAuditLog(action: string, userId: string, details: any) {
  auditLogs.unshift({
    id: Date.now().toString() + Math.random().toString(36),
    action,
    userId,
    details,
    timestamp: new Date().toISOString(),
    source: 'internal'
  });
  if (auditLogs.length > 1000) auditLogs = auditLogs.slice(0, 1000);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = (req.query.action as string) || req.body?.action;
  const discordId = (req.query.discordId as string) || req.body?.discordId;

  if (!action) return res.status(400).json({ error: 'Action is required' });

  const adminActions = ['check_admin', 'staff_list', 'add_staff', 'remove_staff', 'update_staff_rank', 'audit_logs', 'dashboard_stats', 'log_categories'];

  if (adminActions.includes(action) && action !== 'check_admin') {
    if (!discordId) return res.status(401).json({ error: 'Discord ID required' });
    const { isAdmin: userIsAdmin, rank } = await isAdmin(discordId);
    if (!userIsAdmin) return res.status(403).json({ error: 'Access denied. Admin only.' });
    if (['add_staff', 'remove_staff', 'update_staff_rank'].includes(action) && rank < 8) {
      return res.status(403).json({ error: 'Rank 8+ required' });
    }
  }

  try {
    switch (action) {

      case 'check_admin': {
        if (!discordId) return res.status(400).json({ error: 'Discord ID required' });
        const { isAdmin: userIsAdmin, rank } = await isAdmin(discordId);
        const user = await getDiscordUser(discordId);
        return res.status(200).json({ success: true, isAdmin: userIsAdmin, rank, user });
      }

      case 'staff_list': {
        const staffWithDetails = await Promise.all(
          staffMembers.map(async (s) => {
            const u = await getDiscordUser(s.discordId);
            return { ...s, username: u?.username || 'Desconhecido', avatar: u?.avatar || '' };
          })
        );
        return res.status(200).json({ success: true, staff: staffWithDetails });
      }

      case 'add_staff': {
        const { targetDiscordId, role, rank: targetRank } = req.body;
        if (!targetDiscordId || !role) return res.status(400).json({ error: 'Missing data' });
        if (staffMembers.some(s => s.discordId === targetDiscordId)) return res.status(400).json({ error: 'Already staff' });

        const newStaff = {
          id: Date.now().toString(),
          discordId: targetDiscordId,
          role,
          rank: targetRank || 5,
          addedAt: new Date().toISOString(),
          addedBy: discordId
        };
        staffMembers.push(newStaff);
        addAuditLog('STAFF_ADD', discordId!, { targetId: targetDiscordId, role, rank: targetRank || 5 });
        return res.status(200).json({ success: true, staff: newStaff });
      }

      case 'remove_staff': {
        const { targetDiscordId } = req.body;
        if (!targetDiscordId) return res.status(400).json({ error: 'Target ID required' });
        if (targetDiscordId === SUPER_ADMIN_DISCORD_ID) return res.status(403).json({ error: 'Cannot remove super admin' });

        const index = staffMembers.findIndex(s => s.discordId === targetDiscordId);
        if (index === -1) return res.status(404).json({ error: 'Not found' });
        const removed = staffMembers.splice(index, 1)[0];
        addAuditLog('STAFF_REMOVE', discordId!, { targetId: targetDiscordId });
        return res.status(200).json({ success: true, removed });
      }

      case 'update_staff_rank': {
        const { targetDiscordId, newRank, newRole } = req.body;
        if (!targetDiscordId) return res.status(400).json({ error: 'Target ID required' });
        const staff = staffMembers.find(s => s.discordId === targetDiscordId);
        if (!staff) return res.status(404).json({ error: 'Not found' });

        const old = { rank: staff.rank, role: staff.role };
        if (newRank !== undefined) staff.rank = newRank;
        if (newRole) staff.role = newRole;
        addAuditLog('STAFF_UPDATE', discordId!, { targetId: targetDiscordId, old, new: { rank: newRank, role: newRole } });
        return res.status(200).json({ success: true, staff });
      }

      case 'dashboard_stats': {
        let totalMembers = 0, onlineMembers = 0;
        try {
          const guildRes = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}?with_counts=true`, {
            headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
          });
          if (guildRes.ok) {
            const g = await guildRes.json();
            totalMembers = g.approximate_member_count || 0;
            onlineMembers = g.approximate_presence_count || 0;
          }
        } catch {}
        const stats = {
          totalMembers,
          onlineMembers,
          staffOnline: Math.max(1, Math.floor((staffMembers.length + Object.keys(FIXED_ADMINS).length) * 0.6)),
          totalStaff: staffMembers.length + Object.keys(FIXED_ADMINS).length,
          recentLogs: auditLogs.length
        };
        return res.status(200).json({ success: true, stats });
      }

      case 'audit_logs': {
        const { category, page = "1", search } = req.query;
        const discordLogs = await fetchDiscordAuditLogs(category as string);
        let allLogs = [
          ...auditLogs.map(l => ({ ...l, source: 'internal' })),
          ...discordLogs.map((l: any) => ({
            id: l.id,
            action: l.action_type || 'UNKNOWN',
            userId: l.user_id,
            details: l.changes || {},
            timestamp: l.id ? new Date((BigInt(l.id) >> BigInt(22)) + BigInt(1420070400000)).toISOString() : new Date().toISOString(),
            source: 'discord'
          }))
        ];

        if (category) allLogs = allLogs.filter(l => l.action.toString().includes(category as string));
        if (search) {
          const s = (search as string).toLowerCase();
          allLogs = allLogs.filter(l =>
            l.action.toLowerCase().includes(s) ||
            l.userId.includes(s) ||
            JSON.stringify(l.details).toLowerCase().includes(s)
          );
        }

        allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const perPage = 20;
        const pageNum = parseInt(page as string);
        const start = (pageNum - 1) * perPage;
        const paginated = allLogs.slice(start, start + perPage);

        return res.status(200).json({
          success: true,
          logs: paginated,
          totalPages: Math.ceil(allLogs.length / perPage),
          total: allLogs.length
        });
      }

      case 'log_categories': {
        const categories = [
          { id: '', label: 'Todos' },
          { id: 'member_join', label: 'Entradas' },
          { id: 'member_remove', label: 'Saídas' },
          { id: 'member_ban_add', label: 'Banimentos' },
          { id: 'member_kick', label: 'Kicks' },
          { id: 'member_role_update', label: 'Cargos' },
          { id: 'STAFF_ADD', label: 'Staff Adicionado' },
          { id: 'STAFF_REMOVE', label: 'Staff Removido' },
          { id: 'STAFF_UPDATE', label: 'Staff Atualizado' }
        ];
        return res.status(200).json({ success: true, categories });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err: any) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
