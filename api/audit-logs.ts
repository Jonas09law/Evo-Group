import type { VercelRequest, VercelResponse } from '@vercel/node';

const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID!;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;

const ACTION_CATEGORY_MAP: Record<number, string> = {
  1: "server",

  // Channels
  10: "channels", // create
  11: "channels", // update
  12: "channels", // delete
  13: "channels", // permission overwrite

  // Members
  20: "members", // kick
  21: "members", // prune
  24: "members", // update
  25: "roles",   // role add/remove

  // Bans
  22: "bans", // ban
  23: "bans", // unban

  // Roles
  30: "roles",
  31: "roles",
  32: "roles",

  // Messages
  72: "messages", // delete
  73: "messages", // bulk delete
  74: "messages", // edit
  75: "messages", // pin/unpin

  // Moderation / Automod
  80: "moderation",
  81: "moderation"
};

// ------------------------------
// PARSE CHANGES
// ------------------------------
function parseChanges(actionType: number, changes: any[]) {
  if (!changes) return null;
  const info: any = {};

  for (const c of changes) {
    switch (actionType) {
      // ---------- Roles ----------
      case 25:
        if (c.key === "$add") info.addedRoles = c.new?.map((r: any) => ({ id: r.id, name: r.name }));
        if (c.key === "$remove") info.removedRoles = c.new?.map((r: any) => ({ id: r.id, name: r.name }));
        break;

      // ---------- Messages ----------
      case 72: // delete
        info.deletedMessage = true;
        if (c.key === "channel_id") info.channelId = c.new;
        break;
      case 73: // bulk delete
        info.bulkDeleted = true;
        if (c.key === "channel_id") info.channelId = c.new;
        break;
      case 74: // edit
        if (c.key === "content") {
          info.oldContent = c.old;
          info.newContent = c.new;
        }
        break;
      case 75: // pin/unpin
        info.pinChange = true;
        if (c.key === "pinned") info.pinned = c.new;
        break;

      // ---------- Bans ----------
      case 22:
        info.type = "ban";
        break;
      case 23:
        info.type = "unban";
        break;

      // ---------- Kick ----------
      case 20:
        info.type = "kick";
        break;

      // ---------- Member update ----------
      case 24:
        info[c.key] = { old: c.old, new: c.new };
        break;

      // ---------- Channels ----------
      case 10:
      case 11:
      case 12:
      case 13:
        info[c.key] = { old: c.old, new: c.new };
        break;

      default:
        info[c.key] = { old: c.old, new: c.new };
        break;
    }
  }

  return info;
}

// ------------------------------
// FETCH AUDIT LOGS
// ------------------------------
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
  } catch (e) {
    console.error("Erro ao buscar logs:", e);
    return [];
  }
}

// ------------------------------
// API HANDLER
// ------------------------------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ success: false, error: "Method not allowed" });

  const { discordId, page = "1", category, search } = req.query as any;

  if (!discordId) return res.status(400).json({ success: false, error: "Missing discordId" });

  try {
    const allLogs = await fetchDiscordAuditLogs(200);
    let logs = [...allLogs];

    if (category && category !== "all") logs = logs.filter(l => l.category === category);
    if (search) {
      const s = search.toLowerCase();
      logs = logs.filter(l => JSON.stringify(l).toLowerCase().includes(s));
    }

    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const perPage = 10;
    const current = Math.max(1, parseInt(page));
    const totalPages = Math.ceil(logs.length / perPage);

    return res.status(200).json({
      success: true,
      logs: logs.slice((current - 1) * perPage, current * perPage),
      page: current,
      totalPages,
      total: logs.length,
      perPage
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message
    });
  }
}

export const config = {
  api: { externalResolver: true }
};
