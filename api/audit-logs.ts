// api/audit-logs.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

const ACTION_CATEGORY_MAP: Record<number, string> = {
  1: "server",
  10: "channels",
  11: "channels",
  12: "channels",
  13: "channels",

  // Members
  20: "members",
  21: "members",
  24: "members",
  25: "roles",

  // Bans
  22: "bans",
  23: "bans",

  // Roles
  30: "roles",
  31: "roles",
  32: "roles",

  // Messages
  72: "messages", // message delete
  73: "messages", // bulk delete
  74: "messages", // message edit
  75: "messages", // pin/unpin

  80: "moderation",
  81: "moderation"
};

function parseChanges(actionType: number, changes: any[]) {
  if (!changes) return null;

  let info: any = {};

  // Detectar cargos adicionados/removidos
  if (actionType === 25) {
    for (const c of changes) {
      if (c.key === "$add") {
        info.addedRoles = c.new?.map((r: any) => ({
          id: r.id,
          name: r.name
        }));
      }
      if (c.key === "$remove") {
        info.removedRoles = c.new?.map((r: any) => ({
          id: r.id,
          name: r.name
        }));
      }
    }
  }

  // Mensagem editada
  if (actionType === 74) {
    for (const c of changes) {
      if (c.key === "content") {
        info.oldContent = c.old;
        info.newContent = c.new;
      }
    }
  }

  // Mensagem deletada
  if (actionType === 72) {
    for (const c of changes) {
      if (c.key === "channel_id") {
        info.channel = c.new;
      }
    }
  }

  return info;
}

async function fetchDiscordAuditLogs(limit = 100) {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/audit-logs?limit=${limit}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!res.ok) return [];

    const data = await res.json();

    return data.audit_log_entries.map((log: any) => {
      const timestamp = log.id
        ? new Date(Number(BigInt(log.id) >> 22n) + 1420070400000).toISOString()
        : new Date().toISOString();

      return {
        id: log.id,
        action: log.action_type,
        category: ACTION_CATEGORY_MAP[log.action_type] || "unknown",
        executor: log.user_id, // quem executou
        target: log.target_id, // quem foi afetado
        details: parseChanges(log.action_type, log.changes),
        reason: log.reason || null,
        timestamp
      };
    });
  } catch {
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET")
    return res.status(405).json({ success: false, error: "Method not allowed" });

  const { discordId, page = "1", category, search } = req.query as any;

  if (!discordId)
    return res.status(400).json({ success: false, error: "Missing discordId" });

  try {
    const all = await fetchDiscordAuditLogs(100);

    let logs = [...all];

    if (category && category !== "all") {
      logs = logs.filter((l) => l.category === category);
    }

    if (search) {
      const lower = search.toLowerCase();
      logs = logs.filter((l) =>
        JSON.stringify(l).toLowerCase().includes(lower)
      );
    }

    logs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const perPage = 10;
    const current = Math.max(1, parseInt(page));
    const totalPages = Math.max(1, Math.ceil(logs.length / perPage));

    const paginated = logs.slice(
      (current - 1) * perPage,
      current * perPage
    );

    return res.status(200).json({
      success: true,
      logs: paginated,
      page: current,
      totalPages,
      total: logs.length,
      perPage
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: err.message
    });
  }
}

export const config = {
  api: { externalResolver: true }
};
