import { NextResponse } from "next/server";
import { createPool } from "@/lib/db/postgres";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const pool = createPool(body);
    await pool.query("SELECT 1");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
