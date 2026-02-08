const WRITE_KEYWORDS = [
  "insert",
  "update",
  "delete",
  "drop",
  "create",
  "alter",
  "truncate",
];

export function isReadOnlySQL(sql: string): boolean {
  const normalized = sql.toLowerCase();

  return !WRITE_KEYWORDS.some((kw) =>
    normalized.includes(`${kw} `)
  );
}
