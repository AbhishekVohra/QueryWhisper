type Column = {
  name: string;
  type: string;
};

type SchemaData = {
  [schemaName: string]: {
    [tableName: string]: Column[];
  };
};

/**
 * Converts DB schema into a deterministic, LLM-friendly string.
 * This is intentionally verbose and explicit to reduce hallucinations.
 */
export function formatSchemaForPrompt(schema: SchemaData): string {
  let output = "Database Schema:\n\n";

  for (const [schemaName, tables] of Object.entries(schema)) {
    output += `Schema "${schemaName}":\n`;

    for (const [tableName, columns] of Object.entries(tables)) {
      output += `Table "${tableName}":\n`;

      for (const column of columns) {
        output += `- ${column.name} (${column.type})\n`;
      }

      output += "\n";
    }

    output += "\n";
  }

  return output.trim();
}
