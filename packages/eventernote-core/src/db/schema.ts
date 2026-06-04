export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS actors (
  actor_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  actor_type TEXT NOT NULL DEFAULT 'unknown'
);

CREATE TABLE IF NOT EXISTS actor_preferences (
  actor_id TEXT PRIMARY KEY REFERENCES actors(actor_id),
  priority TEXT NOT NULL CHECK(priority IN ('S+','S','A','B','C')),
  enabled INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'manual',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS actor_groups (
  group_actor_id TEXT NOT NULL REFERENCES actors(actor_id),
  child_actor_id TEXT NOT NULL REFERENCES actors(actor_id),
  source TEXT NOT NULL DEFAULT 'manual',
  PRIMARY KEY (group_actor_id, child_actor_id)
);

CREATE TABLE IF NOT EXISTS places (
  place_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  address TEXT,
  official_site TEXT,
  tips TEXT,
  map_url TEXT
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  date TEXT,
  weekday TEXT,
  open_time TEXT,
  start_time TEXT,
  end_time TEXT,
  place_id TEXT REFERENCES places(place_id),
  venue_name TEXT
);

CREATE TABLE IF NOT EXISTS event_performers (
  event_id TEXT NOT NULL REFERENCES events(event_id),
  actor_id TEXT NOT NULL REFERENCES actors(actor_id),
  actor_name TEXT NOT NULL,
  actor_url TEXT NOT NULL,
  PRIMARY KEY (event_id, actor_id)
);
`;
