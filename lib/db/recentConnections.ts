export type RecentDbConnection = {
  id: string;
  host: string;
  port: number;
  database: string;
  label: string;
  lastUsedAt: number;
};

const KEY = "querywhisper.recent.dbs";
const MAX = 5;

export function loadRecentDbs(): RecentDbConnection[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecentDb(
  conn: Omit<
    RecentDbConnection,
    "id" | "lastUsedAt"
  >
) {
  if (typeof window === "undefined") return;

  const existing = loadRecentDbs();

  const filtered = existing.filter(
    (c) =>
      !(
        c.host === conn.host &&
        c.port === conn.port &&
        c.database === conn.database
      )
  );

  const updated: RecentDbConnection[] = [
    {
      id: crypto.randomUUID(),
      ...conn,
      lastUsedAt: Date.now(),
    },
    ...filtered,
  ].slice(0, MAX);

  localStorage.setItem(
    KEY,
    JSON.stringify(updated)
  );
}
