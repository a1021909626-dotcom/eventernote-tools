import { actorIdFromUrl, openEventernoteDb } from "@cknl/eventernote-core";
import type { Domain } from "../types.js";

function resolveDb(get: (name: string) => string | undefined): string {
  const db = get("db") ?? process.env.EVENTERNOTE_DB;
  if (!db) throw new Error("--db or EVENTERNOTE_DB environment variable is required");
  return db;
}

export const prefsDomain: Domain = {
  name: "prefs",
  description: "Manage local interested-actor preferences.",
  subcommands: [
    {
      name: "list",
      description: "List locally stored interested actors.",
      flags: [
        { name: "db", arg: "<path>", description: "SQLite database path (default: $EVENTERNOTE_DB)" },
        { name: "priority", arg: "S+|S|A|B|C", description: "Filter by priority tier" },
        { name: "format", arg: "markdown|json", description: "Output format (default: markdown)" },
      ],
      async handler(get) {
        const db = openEventernoteDb(resolveDb(get));
        try {
          const filter = get("priority");
          const prefs = db.listPreferences().filter((p) => !filter || p.priority === filter);
          if (get("format") === "json") {
            console.log(JSON.stringify(prefs, null, 2));
          } else {
            const rows = ["| actor_id | priority | source | notes |", "| --- | --- | --- | --- |"];
            for (const p of prefs) {
              rows.push(`| ${p.actorId} | ${p.priority} | ${p.source} | ${p.notes ?? ""} |`);
            }
            console.log(rows.join("\n"));
          }
        } finally {
          db.close();
        }
      },
    },
    {
      name: "upsert",
      description: "Add or update an interested actor with priority.",
      flags: [
        { name: "actor-id", arg: "<id>", description: "Actor ID", required: true },
        { name: "actor-url", arg: "<url>", description: "Actor URL (alternative to --actor-id)" },
        { name: "actor-name", arg: "<name>", description: "Actor display name (stored in actors table)" },
        { name: "priority", arg: "S+|S|A|B|C", description: "Priority tier", required: true },
        { name: "notes", arg: "<text>", description: "Optional personal notes" },
        { name: "db", arg: "<path>", description: "SQLite database path (default: $EVENTERNOTE_DB)" },
      ],
      async handler(get) {
        const rawId = get("actor-id");
        const rawUrl = get("actor-url");
        const actorId = rawId ?? (rawUrl ? actorIdFromUrl(rawUrl) : undefined);
        if (!actorId) throw new Error("--actor-id or --actor-url is required");
        const priority = get("priority") as "S+" | "S" | "A" | "B" | "C";
        if (!priority) throw new Error("--priority is required");
        const db = openEventernoteDb(resolveDb(get));
        try {
          const actorName = get("actor-name") ?? actorId;
          const actorUrl = rawUrl ?? `https://www.eventernote.com/actors/_/${actorId}`;
          db.upsertActor({ actorId, name: actorName, url: actorUrl });
          db.upsertPreference({ actorId, priority, enabled: true, source: "manual", notes: get("notes") });
          console.log(JSON.stringify({ actorId, priority, enabled: true }, null, 2));
        } finally {
          db.close();
        }
      },
    },
    {
      name: "disable",
      description: "Disable an interested actor without deleting history.",
      flags: [
        { name: "actor-id", arg: "<id>", description: "Actor ID", required: true },
        { name: "db", arg: "<path>", description: "SQLite database path (default: $EVENTERNOTE_DB)" },
      ],
      async handler(get) {
        const actorId = get("actor-id");
        if (!actorId) throw new Error("--actor-id is required");
        const db = openEventernoteDb(resolveDb(get));
        try {
          db.upsertPreference({ actorId, priority: "C", enabled: false, source: "manual" });
          console.log(JSON.stringify({ actorId, enabled: false }, null, 2));
        } finally {
          db.close();
        }
      },
    },
    {
      name: "import-favorites",
      description: "Import Eventernote favorite actors from a manually logged-in browser session.",
      flags: [
        { name: "browser", arg: "playwright", description: "Browser automation backend" },
        { name: "dry-run", description: "Show candidates without writing to DB" },
        { name: "db", arg: "<path>", description: "SQLite database path (default: $EVENTERNOTE_DB)" },
      ],
      async handler() {
        throw new Error(
          "prefs import-favorites is not yet implemented in the CLI.\n" +
          "Use the MCP tool 'preferences_import_favorites' with favoriteActorsHtml instead.",
        );
      },
    },
  ],
};
