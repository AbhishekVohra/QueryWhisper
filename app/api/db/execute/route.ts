export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Pool, FieldDef } from "pg";

import { validateSQL } from "@/lib/sql/validate";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sql, connection } = body;

    if (!sql || !connection) {
      return NextResponse.json(
        { error: "Missing SQL or connection" },
        { status: 400 }
      );
    }

    const validation = validateSQL(sql);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
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
