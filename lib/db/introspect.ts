import { getPool } from "./postgres";

export async function introspectSchema() {
  const pool = getPool();

  const query = `
    SELECT
      table_schema,
      table_name,
      column_name,
      data_type
    FROM information_schema.columns
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name, ordinal_position;
  `;

  const { rows } = await pool.query(query);

  const schema: Record<string, any> = {};

  for (const row of rows) {
    const { table_schema, table_name, column_name, data_type } = row;

    if (!schema[table_schema]) {
      schema[table_schema] = {};
    }

    if (!schema[table_schema][table_name]) {
      schema[table_schema][table_name] = [];
    }

    schema[table_schema][table_name].push({
      name: column_name,
      type: data_type,
    });
  }

  return schema;
}
