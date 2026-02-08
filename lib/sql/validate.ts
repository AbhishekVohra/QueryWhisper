/**
 * Very conservative SQL validator.
 * Allows only single SELECT statements.
 */
export function validateSQL(sql: string): {
  valid: boolean;
  reason?: string;
} {
  const normalized = sql.trim().toLowerCase();

  if (!normalized.startsWith("select")) {
    return {
      valid: false,
      reason: "Only SELECT queries are allowed.",
    };
  }

  const forbidden = [
    "insert ",
    "update ",
    "delete ",
    "drop ",
    "alter ",
    "truncate ",
    "create ",
    "grant ",
    "revoke ",
  ];

  for (const keyword of forbidden) {
    if (normalized.includes(keyword)) {
      return {
        valid: false,
        reason: `Forbidden keyword detected: ${keyword.trim()}`,
      };
    }
  }

  // Prevent multiple statements
  if (normalized.split(";").length > 2) {
    return {
      valid: false,
      reason: "Multiple SQL statements are not allowed.",
    };
  }

  return { valid: true };
}
