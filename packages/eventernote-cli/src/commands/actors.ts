import { createLookupService } from "@cknl/eventernote-core";
import { renderActorTable, renderEventTable } from "../render.js";
import type { Domain } from "../types.js";

export const actorsDomain: Domain = {
  name: "actors",
  description: "Search actors and list their events.",
  subcommands: [
    {
      name: "search",
      description: "Find actors by keyword.",
      flags: [
        { name: "keyword", arg: "<text>", description: "Search keyword", required: true },
        { name: "page", arg: "<n>", description: "Page number" },
        { name: "format", arg: "markdown|json", description: "Output format (default: markdown)" },
      ],
      async handler(get) {
        const keyword = get("keyword");
        if (!keyword) throw new Error("--keyword is required");
        const lookup = createLookupService();
        const result = await lookup.searchActors({ keyword });
        if (get("format") === "json") {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(renderActorTable(result.actors));
        }
      },
    },
    {
      name: "events",
      description: "List all events for one actor.",
      flags: [
        { name: "actor-id", arg: "<id>", description: "Actor ID" },
        { name: "actor-url", arg: "<url>", description: "Actor URL (alternative to --actor-id)" },
        { name: "page", arg: "<n>", description: "Page number" },
        { name: "limit", arg: "<n>", description: "Max results per page" },
        { name: "format", arg: "markdown|json", description: "Output format (default: markdown)" },
      ],
      async handler(get) {
        const actorId = get("actor-id") ?? get("actor-url")?.split("/").pop();
        if (!actorId) throw new Error("--actor-id or --actor-url is required");
        const lookup = createLookupService();
        const result = await lookup.actorEvents({
          actorId,
          page: get("page") ? Number(get("page")) : undefined,
          limit: get("limit") ? Number(get("limit")) : undefined,
        });
        if (get("format") === "json") {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(renderEventTable(result.events));
        }
      },
    },
  ],
};
