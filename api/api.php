import type { VercelRequest, VercelResponse } from '@vercel/node';

const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const SUPER_ADMIN_DISCORD_ID = "1113945518071107705"; 

let staffMembers: any[] = [];
let auditLogs: any[] = [];

async function isAdmin(discordId: string): Promise<{ isAdmin: boolean; rank: number }> {

  if (discordId === SUPER_ADMIN_DISCORD_ID) {
    return { isAdmin: true, rank: 10 };
  }
  
  const staff = staffMembers.find(s => s.discordId === discordId);
  if (staff) {
    return { isAdmin: true, rank: staff.rank || 5 };
  }
  
  return { isAdmin: false, rank: 0 };
}

async function getDiscordUser(discordId: string) {
  try {
    const response = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
    });
    
    if (!response.ok) return null;
    
    const user = await response.json();
    return {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=5865F2&color=fff`
    };
  } catch (err) {
    console.error('Error fetching Discord user:', err);
    return null;
  }
}

async function fetchDiscordAuditLogs(actionType?: string) {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/audit-logs${actionType ? `?action_type=${actionType}` : ''}`,
      {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
      }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.audit_log_entries || [];
  } catch (err) {
    console.error('Error fetching Discord audit logs:', err);
    return [];
  }
}

function addAuditLog(action: string, userId: string, details: any) {
  auditLogs.unshift({
    id: Date.now().toString(),
    action,
    userId,
    details,
    timestamp: new Date().toISOString()
  });
  
  if (auditLogs.length > 1000) {
    auditLogs = auditLogs.slice(0, 1000);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action as string || req.body?.action;
  const discordId = req.query.discordId as string || req.body?.discordId;

  if (!action) {
    return res.status(400).json({ error: 'Action is required' });
  }

  const adminActions = ['add_staff', 'remove_staff', 'update_staff_rank', 'staff_list', 'audit_logs', 'dashboard_stats'];
  
  if (adminActions.includes(action)) {
    if (!discordId) {
      return res.status(401).json({ error: 'Discord ID is required' });
    }
    
    const { isAdmin: userIsAdmin, rank } = await isAdmin(discordId);
    
    if (!userIsAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    if (action === 'add_staff' || action === 'remove_staff' || action === 'update_staff_rank') {
      if (rank < 8) {
        return res.status(403).json({ error: 'Insufficient permissions. Rank 8+ required.' });
      }
    }
  }

  try {
    switch (action) {
      case 'check_admin': {
        if (!discordId) {
          return res.status(400).json({ error: 'Discord ID is required' });
        }
        
        const { isAdmin: userIsAdmin, rank } = await isAdmin(discordId);
        const user = await getDiscordUser(discordId);
        
        return res.status(200).json({
          success: true,
          isAdmin: userIsAdmin,
          rank,
          user
        });
      }

      case 'staff_list': {

        const staffWithDetails = await Promise.all(
          staffMembers.map(async (staff) => {
            const user = await getDiscordUser(staff.discordId);
            return {
              ...staff,
              username: user?.username || 'Unknown',
              avatar: user?.avatar || '',
              discriminator: user?.discriminator || '0000'
            };
          })
        );
        
        return res.status(200).json({
          success: true,
          staff: staffWithDetails
        });
      }

      case 'add_staff': {
        const { targetDiscordId, role, rank: targetRank } = req.body;
        
        if (!targetDiscordId || !role) {
          return res.status(400).json({ error: 'Target Discord ID and role are required' });
        }
        
        if (staffMembers.find(s => s.discordId === targetDiscordId)) {
          return res.status(400).json({ error: 'User is already a staff member' });
        }
        
        const targetUser = await getDiscordUser(targetDiscordId);
        if (!targetUser) {
          return res.status(404).json({ error: 'Discord user not found' });
        }
        
        const newStaff = {
          id: Date.now().toString(),
          discordId: targetDiscordId,
          role,
          rank: targetRank || 5,
          addedAt: new Date().toISOString(),
          addedBy: discordId
        };
        
        staffMembers.push(newStaff);
        
        addAuditLog('STAFF_ADD', discordId!, {
          targetId: targetDiscordId,
          role,
          rank: targetRank || 5
        });
        
        return res.status(200).json({
          success: true,
          staff: newStaff
        });
      }

      case 'remove_staff': {
        const { targetDiscordId } = req.body;
        
        if (!targetDiscordId) {
          return res.status(400).json({ error: 'Target Discord ID is required' });
        }
        
        if (targetDiscordId === SUPER_ADMIN_DISCORD_ID) {
          return res.status(403).json({ error: 'Cannot remove super admin' });
        }
        
        const index = staffMembers.findIndex(s => s.discordId === targetDiscordId);
        if (index === -1) {
          return res.status(404).json({ error: 'Staff member not found' });
        }
        
        const removed = staffMembers.splice(index, 1)[0];
        
        addAuditLog('STAFF_REMOVE', discordId!, {
          targetId: targetDiscordId,
          role: removed.role
        });
        
        return res.status(200).json({
          success: true,
          removed
        });
      }

      case 'update_staff_rank': {
        const { targetDiscordId, newRank, newRole } = req.body;
        
        if (!targetDiscordId) {
          return res.status(400).json({ error: 'Target Discord ID is required' });
        }
        
        const staff = staffMembers.find(s => s.discordId === targetDiscordId);
        if (!staff) {
          return res.status(404).json({ error: 'Staff member not found' });
        }
        
        const oldRank = staff.rank;
        const oldRole = staff.role;
        
        if (newRank !== undefined) staff.rank = newRank;
        if (newRole) staff.role = newRole;

        addAuditLog('STAFF_UPDATE', discordId!, {
          targetId: targetDiscordId,
          oldRank,
          newRank,
          oldRole,
          newRole
        });
        
        return res.status(200).json({
          success: true,
          staff
        });
      }

      case 'audit_logs': {
        const { category, page = 1, perPage = 20, search } = req.query;
        
        let discordLogs = await fetchDiscordAuditLogs(category as string);
        
        let combinedLogs = [
          ...auditLogs.map(log => ({
            ...log,
            source: 'internal'
          })),
          ...discordLogs.map((log: any) => ({
            id: log.id,
            action: log.action_type,
            userId: log.user_id,
            details: log.changes || {},
            timestamp: log.id ? new Date(parseInt(log.id) / 4194304 + 1420070400000).toISOString() : new Date().toISOString(),
            source: 'discord'
          }))
        ];

        if (category) {
          combinedLogs = combinedLogs.filter(log => 
            log.action.toLowerCase().includes((category as string).toLowerCase())
          );
        }

        if (search && typeof search === 'string') {
          const searchLower = search.toLowerCase();
          combinedLogs = combinedLogs.filter(log =>
            log.action.toLowerCase().includes(searchLower) ||
            log.userId?.toLowerCase().includes(searchLower) ||
            JSON.stringify(log.details).toLowerCase().includes(searchLower)
          );
        }
        
        combinedLogs.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        const pageNum = parseInt(page as string);
        const perPageNum = parseInt(perPage as string);
        const start = (pageNum - 1) * perPageNum;
        const paginatedLogs = combinedLogs.slice(start, start + perPageNum);
        
        return res.status(200).json({
          success: true,
          logs: paginatedLogs,
          page: pageNum,
          totalPages: Math.ceil(combinedLogs.length / perPageNum),
          total: combinedLogs.length
        });
      }

      case 'dashboard_stats': {

        try {
          const guildResponse = await fetch(
            `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}?with_counts=true`,
            {
              headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
            }
          );
          
          let stats = {
            totalMembers: 0,
            onlineMembers: 0,
            staffOnline: 0,
            totalStaff: staffMembers.length,
            recentLogs: auditLogs.slice(0, 5).length
          };
          
          if (guildResponse.ok) {
            const guild = await guildResponse.json();
            stats.totalMembers = guild.approximate_member_count || 0;
            stats.onlineMembers = guild.approximate_presence_count || 0;
          }
          
          stats.staffOnline = Math.floor(staffMembers.length * 0.6); 
          
          return res.status(200).json({
            success: true,
            stats
          });
        } catch (err) {
          return res.status(500).json({ error: 'Error fetching stats', details: err });
        }
      }

      case 'log_categories': {

        const categories = [
          { id: 'member_join', label: 'Entradas', icon: 'user-plus' },
          { id: 'member_remove', label: 'Saídas', icon: 'user-minus' },
          { id: 'member_ban_add', label: 'Banimentos', icon: 'ban' },
          { id: 'member_kick', label: 'Kicks', icon: 'user-x' },
          { id: 'member_role_update', label: 'Cargos', icon: 'shield' },
          { id: 'channel_create', label: 'Canais', icon: 'hash' },
          { id: 'message_delete', label: 'Mensagens', icon: 'message-square' },
          { id: 'STAFF_ADD', label: 'Staff (Adições)', icon: 'user-plus' },
          { id: 'STAFF_REMOVE', label: 'Staff (Remoções)', icon: 'user-minus' },
          { id: 'STAFF_UPDATE', label: 'Staff (Atualizações)', icon: 'edit' }
        ];
        
        return res.status(200).json({
          success: true,
          categories
        });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err });
  }
}