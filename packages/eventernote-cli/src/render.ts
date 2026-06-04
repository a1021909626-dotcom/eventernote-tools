import type { Actor, EventDetail, EventSummary, Place, PlaceCandidate, ResearchSummary } from "@cknl/eventernote-core";

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|");
}

function bulletList(values: string[]): string {
  return values.length > 0 ? values.map((value) => `- ${value}`).join("\n") : "-";
}

export function renderEventTable(events: EventSummary[]): string {
  const rows = ["| id | date | start | title |", "| --- | --- | --- | --- |"];
  for (const event of events) {
    rows.push(`| ${event.eventId} | ${event.date} | ${event.startTime ?? ""} | ${escapeCell(event.title)} |`);
  }
  return rows.join("\n");
}

export function renderActorTable(actors: Actor[]): string {
  const rows = ["| id | name | kana |", "| --- | --- | --- |"];
  for (const actor of actors) {
    rows.push(`| ${actor.actorId} | ${escapeCell(actor.name)} | ${actor.kana ?? ""} |`);
  }
  return rows.join("\n");
}

export function renderPlaceTable(places: PlaceCandidate[]): string {
  const rows = ["| id | name | prefecture |", "| --- | --- | --- |"];
  for (const place of places) {
    rows.push(`| ${place.placeId} | ${escapeCell(place.name)} | ${place.prefecture ?? ""} |`);
  }
  return rows.join("\n");
}

export function renderEventDetail(event: EventDetail, research?: ResearchSummary): string {
  const lines = [
    `# ${event.title}`,
    "",
    `- id: ${event.eventId}`,
    `- date: ${event.date}${event.weekday ? ` (${event.weekday})` : ""}`,
    `- open: ${event.openTime ?? ""}`,
    `- start: ${event.startTime ?? ""}`,
    `- end: ${event.endTime ?? ""}`,
    `- venue: ${event.venueName ?? ""}${event.placeId ? ` (${event.placeId})` : ""}`,
    `- url: ${event.url}`,
    "",
    "## Performers",
    bulletList(event.performers.map((actor) => `${actor.actorId} ${actor.name}`)),
  ];

  if (event.relatedLinks.length > 0) {
    lines.push("", "## Related Links", bulletList(event.relatedLinks.map((link) => `${link.label ?? link.url}: ${link.url}`)));
  }

  if (event.descriptionText) {
    lines.push("", "## Description", event.descriptionText);
  }

  if (research) {
    lines.push("", "## Research", research.summary, "", "### Ticket URLs", bulletList(research.ticketUrls), "", "### Warnings", bulletList(research.warnings));
  }

  return lines.join("\n");
}

export function renderPlaceDetail(place: Place, events: EventSummary[]): string {
  const lines = [
    `# ${place.name}`,
    "",
    `- id: ${place.placeId}`,
    `- prefecture: ${place.prefecture ?? ""}`,
    `- address: ${place.address ?? ""}`,
    `- officialSite: ${place.officialSite ?? ""}`,
    `- mapUrl: ${place.mapUrl ?? ""}`,
    `- url: ${place.url}`,
  ];

  if (place.tips) {
    lines.push("", "## Tips", place.tips);
  }

  lines.push("", "## Recent Events", renderEventTable(events));
  return lines.join("\n");
}
