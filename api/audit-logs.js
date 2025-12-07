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
  if (auditLogsInternal.length > 1000) {
    auditLogsInternal = auditLogsInternal.slice(0, 1000);
  }
}

async function fetchDiscordAuditLogs() {
  try {

    const res = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/audit-logs`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
    });
    
    if (!res.ok) {
      console.error('Discord API error:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json();
    
    if (!data.audit_log_entries || !Array.isArray(data.audit_log_entries)) {
      return [];
    }
    
    return data.audit_log_entries.map((log: any) => ({
      id: log.id,
      action: log.action_type,
      userId: log.user_id,
      details: log.changes || {},
      timestamp: log.id 
        ? new Date(parseInt(log.id) / 4194304 + 1420070400000).toISOString() 
        : new Date().toISOString(),
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
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { discordId, page = '1', category, search } = req.query as { 
    discordId?: string; 
    page?: string;
    category?: string;
    search?: string;
  };
  
  if (!discordId) {
    return res.status(400).json({ success: false, error: 'Missing discordId' });
  }

  try {

    const discordLogs = await fetchDiscordAuditLogs();
    
    let combinedLogs = [...auditLogsInternal, ...discordLogs];
    
    if (category) {
      combinedLogs = combinedLogs.filter(log => 
        log.action.toString().toLowerCase().includes(category.toLowerCase())
      );
    }
    
    if (search) {
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

    const perPage = 10;
    const currentPage = parseInt(page.toString());
    const totalPages = Math.ceil(combinedLogs.length / perPage);
    const paginatedLogs = combinedLogs.slice(
      (currentPage - 1) * perPage, 
      currentPage * perPage
    );

    return res.status(200).json({
      success: true,
      logs: paginatedLogs,
      page: currentPage,
      totalPages,
      total: combinedLogs.length
    });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}
