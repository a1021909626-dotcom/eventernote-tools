const ACTOR_RE = /\/actors\/(?:[^/?#]+\/)?(\d+)(?:[/?#].*)?$/;
const EVENT_RE = /\/events\/(\d+)(?:[/?#].*)?$/;
const PLACE_RE = /\/places\/(\d+)(?:\/events)?(?:[/?#].*)?$/;

export function actorIdFromUrl(url: string): string | undefined {
  return ACTOR_RE.exec(url)?.[1];
}

export function eventIdFromUrl(url: string): string | undefined {
  return EVENT_RE.exec(url)?.[1];
}

export function placeIdFromUrl(url: string): string | undefined {
  return PLACE_RE.exec(url)?.[1];
}
