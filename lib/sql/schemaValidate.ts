type SchemaData = {
  [schemaName: string]: {
    [tableName: string]: {
      name: string;
      type: string;
    }[];
  };
};

const DISALLOWED_KEYWORDS = [
  "insert",
  "update",
  "delete",
  "drop",
  "create",
  "alter",
  "truncate",
];

export function validateSQLAgainstSchema(
  sql: string,
  schema: SchemaData
): { valid: boolean; reason?: string } {
  const normalized = sql.toLowerCase();

  // 1. Block non-read queries
  for (const keyword of DISALLOWED_KEYWORDS) {
    if (normalized.includes(`${keyword} `)) {
      return {
        valid: false,
        reason:
          "Sorry — QueryWhisper is read-only. It can only query data, not modify it.",
      };
    }
  }

  if (!normalized.startsWith("select")) {
    return {
      valid: false,
      reason:
        "Only SELECT queries are supported.",
    };
  }

  // Build lookup maps
  const tableSet = new Set<string>();
  const columnMap = new Map<string, Set<string>>();

  for (const tables of Object.values(schema)) {
    for (const [table, columns] of Object.entries(
      tables
    )) {
      tableSet.add(table);
      columnMap.set(
        table,
        new Set(columns.map((c) => c.name))
      );
    }
  }

  // 2. Extract referenced tables (simple but effective)
  const tableMatches = [
    ...normalized.matchAll(
      /\bfrom\s+([a-zA-Z0-9_.]+)/g
    ),
    ...normalized.matchAll(
      /\bjoin\s+([a-zA-Z0-9_.]+)/g
    ),
  ];

  for (const match of tableMatches) {
    const table = match[1].split(".").pop()!;
    if (!tableSet.has(table)) {
      return {
        valid: false,
        reason: `Table "${table}" does not exist in the schema.`,
      };
    }
  }

  // 3. Extract selected columns (best-effort)
  const selectMatch = normalized.match(
    /select\s+(.+?)\s+from\s/i
  );

  if (selectMatch) {
    const rawColumns = selectMatch[1]
      .split(",")
      .map((c) => c.trim())
      .filter(
        (c) =>
          c !== "*" &&
          !c.includes("(") &&
          !c.includes(" ")
      );

    for (const col of rawColumns) {
      let found = false;
      for (const cols of columnMap.values()) {
        if (cols.has(col)) {
          found = true;
          break;
        }
      }

      if (!found) {
        return {
          valid: false,
          reason: `Column "${col}" does not exist in the schema.`,
        };
      }
    }
  }

  return { valid: true };
}
