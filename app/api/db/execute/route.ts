export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Pool, FieldDef } from "pg";

import { validateSQL } from "@/lib/sql/validate";
import { validateSQLAgainstSchema } from "@/lib/sql/schemaValidate";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sql, connection, schema } = body;

    if (!sql || !connection || !schema) {
      return NextResponse.json(
        { error: "Missing SQL, schema, or connection" },
        { status: 400 }
      );
    }

    // 1. Generic SQL safety
    const basicValidation = validateSQL(sql);
    if (!basicValidation.valid) {
      return NextResponse.json(
        { error: basicValidation.reason },
        { status: 400 }
      );
    }

    // 2. Schema-aware validation
    const schemaValidation =
      validateSQLAgainstSchema(sql, schema);

    if (!schemaValidation.valid) {
      return NextResponse.json(
        { error: schemaValidation.reason },
        { status: 400 }
      );
    }

    const pool = new Pool({
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.user,
      password: connection.password,
    });

    const result = await pool.query(sql);
    await pool.end();

    return NextResponse.json({
      columns: result.fields.map(
        (f: FieldDef) => f.name
      ),
      rows: result.rows,
      rowCount: result.rowCount,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
