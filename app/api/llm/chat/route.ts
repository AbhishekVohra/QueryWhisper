export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { SYSTEM_PROMPT } from "@/lib/prompt/system";
import { formatSchemaForPrompt } from "@/lib/prompt/schema";
import { formatMetadataForPrompt } from "@/lib/prompt/metadata";
import { callDeepSeek } from "@/lib/llm/deepseek";
import { parseLLMResponse } from "@/lib/llm/parseResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, schema, metadata } = body;

    if (!question || !schema) {
      return NextResponse.json(
        { error: "Missing question or schema" },
        { status: 400 }
      );
    }

    const fullPrompt = `
${SYSTEM_PROMPT}

${formatSchemaForPrompt(schema)}

${formatMetadataForPrompt(metadata)}

User Question:
${question}
`.trim();

    const rawResponse = await callDeepSeek(fullPrompt);

    const { explanation, sql } =
      parseLLMResponse(rawResponse);

    return NextResponse.json({
      explanation,
      sql,
      raw: rawResponse,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
