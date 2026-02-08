/**
 * Robustly parses LLM output into explanation + SQL.
 * Handles variations with or without ```sql blocks.
 */
export function parseLLMResponse(raw: string): {
  explanation: string;
  sql: string;
} {
  let explanation = "";
  let sql = "";

  // Extract SQL (with or without code fences)
  const sqlBlockMatch = raw.match(
    /SQL:\s*```sql\s*([\s\S]*?)```/i
  );

  if (sqlBlockMatch) {
    sql = sqlBlockMatch[1].trim();
  } else {
    const sqlLineMatch = raw.match(
      /SQL:\s*([\s\S]*)$/i
    );
    if (sqlLineMatch) {
      sql = sqlLineMatch[1].trim();
    }
  }

  // Extract explanation (everything between Explanation: and SQL:)
  const explanationMatch = raw.match(
    /Explanation:\s*([\s\S]*?)\n\s*SQL:/i
  );

  if (explanationMatch) {
    explanation = explanationMatch[1].trim();
  }

  return { explanation, sql };
}