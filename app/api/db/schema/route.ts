import { NextResponse } from "next/server";
import { introspectSchema } from "@/lib/db/introspect";

export async function GET() {
  try {
    const schema = await introspectSchema();
    return NextResponse.json(schema);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
