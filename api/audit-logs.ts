// api/audit-logs.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

// Mapeamento de action types para categorias
const ACTION_CATEGORY_MAP: Record<number, string> = {
  // Server
  1: 'server',
  
  // Channels
  10: 'channels',
  11: 'channels',
  12: 'channels',
  13: 'channels',
  
  // Members
  20: 'members',
  21: 'members',
  22: 'bans',
  23: 'bans',
  24: 'members',
  25: 'roles',
  
  // Roles
  30: 'roles',
  31: 'roles',
  32: 'roles',
  
  // Messages
  72: 'messages',
  73: 'messages',
  74: 'messages',
  75: 'messages',
  
  // Moderation
  80: 'moderation',
  81: 'moderation'
};

async function fetchDiscordAuditLogs(limit = 100) {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/audit-logs?limit=${limit}`,
      {
        headers: { 
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Discord API error:', res.status, errorText);
      return [];
    }
    
    const data = await res.json();
    
    if (!data.audit_log_entries || !Array.isArray(data.audit_log_entries)) {
      console.error('Invalid audit log response:', data);
      return [];
    }
    
    // Processar logs
    return data.audit_log_entries.map((log: any) => {
      // Calcular timestamp a partir do snowflake ID
      const timestamp = log.id 
        ? new Date(Number(BigInt(log.id) >> 22n) + 1420070400000).toISOString()
        : new Date().toISOString();

      return {
        id: log.id,
        action: log.action_type,
        category: ACTION_CATEGORY_MAP[log.action_type] || 'server',
        userId: log.user_id,
        targetId: log.target_id,
        details: log.changes || [],
        reason: log.reason || null,
        timestamp,
        source: 'discord'
      };
    });
  } catch (err) {
    console.error('Erro ao buscar logs Discord:', err);
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { 
    discordId, 
    page = '1', 
    category, 
    search 
  } = req.query as { 
    discordId?: string; 
    page?: string;
    category?: string;
    search?: string;
  };
  
  // Validação básica
  if (!discordId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing discordId parameter' 
    });
  }

  try {
    // Buscar logs do Discord
    console.log('Fetching Discord audit logs...');
    const allLogs = await fetchDiscordAuditLogs(100);
    
    console.log(`Fetched ${allLogs.length} logs from Discord`);

    let filteredLogs = [...allLogs];

    // Filtrar por categoria
    if (category && category !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.category === category);
      console.log(`Filtered by category "${category}": ${filteredLogs.length} logs`);
    }

    // Filtrar por termo de pesquisa
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => {
        const actionStr = String(log.action).toLowerCase();
        const userIdStr = String(log.userId || '').toLowerCase();
        const detailsStr = JSON.stringify(log.details || {}).toLowerCase();
        
        return actionStr.includes(searchLower) ||
               userIdStr.includes(searchLower) ||
               detailsStr.includes(searchLower);
      });
      console.log(`Filtered by search "${search}": ${filteredLogs.length} logs`);
    }

    // Ordenar por timestamp (mais recente primeiro)
    filteredLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Paginação
    const perPage = 10;
    const currentPage = Math.max(1, parseInt(page.toString()));
    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / perPage));
    
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    console.log(`Returning page ${currentPage}/${totalPages} with ${paginatedLogs.length} logs`);

    return res.status(200).json({
      success: true,
      logs: paginatedLogs,
      page: currentPage,
      totalPages,
      total: filteredLogs.length,
      perPage
    });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
