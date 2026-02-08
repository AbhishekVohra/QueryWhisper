export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { callLLM } from "@/lib/llm/router";

export async function POST(req: Request) {
  try {
    const {
      question,
      result,
      modelConfig,
      metadata,
    } = await req.json();

    if (!result || !question) {
      return NextResponse.json(
        { error: "Missing analysis input" },
        { status: 400 }
      );
    }

    const rows =
      result.rows.length <= 100
        ? result.rows
        : [
            ...result.rows.slice(0, 50),
            ...result.rows.slice(-50),
          ];

    const prompt = `
You are a careful data analyst.

You are given the RESULT of a SQL query.
You MUST follow these rules:

1. Use ONLY the data provided below.
2. Do NOT assume meaning not present in the data.
3. If a conclusion cannot be supported, explicitly say so.
4. For each insight, mention the column(s) used.
5. Do NOT generate SQL.
6. Do NOT guess or hallucinate.

Metadata (column context, if any):
${metadata || "None provided"}

Columns:
${JSON.stringify(result.columns)}

Row count:
${result.rowCount}

Rows:
${JSON.stringify(rows, null, 2)}

User question:
${question}

Respond with clear, evidence-based insights.
If the data is insufficient, say why.
`.trim();

    const response = await callLLM(
      prompt,
      modelConfig
    );

    return NextResponse.json({
      analysis: response,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
