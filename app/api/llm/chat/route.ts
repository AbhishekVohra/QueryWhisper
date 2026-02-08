export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { SYSTEM_PROMPT } from "@/lib/prompt/system";
import { formatSchemaForPrompt } from "@/lib/prompt/schema";
import { formatMetadataForPrompt } from "@/lib/prompt/metadata";
import { parseLLMResponse } from "@/lib/llm/parseResponse";
import { isReadOnlySQL } from "@/lib/sql/isReadOnly";
import { callLLM, ModelConfig } from "@/lib/llm/router";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      question,
      schema,
      metadata,
      modelConfig,
    } = body;

    if (!question || !schema || !modelConfig) {
      return NextResponse.json(
        { error: "Missing input" },
        { status: 400 }
      );
    }

    const prompt = `
${SYSTEM_PROMPT}

${formatSchemaForPrompt(schema)}
${formatMetadataForPrompt(metadata)}

User Question:
${question}
`.trim();

    const raw = await callLLM(
      prompt,
      modelConfig as ModelConfig
    );

    const { explanation, sql } =
      parseLLMResponse(raw);

    if (sql && !isReadOnlySQL(sql)) {
      return NextResponse.json({
        explanation:
          "Sorry — QueryWhisper is read-only. It can only query data, not modify it.",
        sql: "",
      });
    }

    return NextResponse.json({
      explanation,
      sql,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
