import { callDeepSeek } from "@/lib/llm/deepseek";
import { callOpenAI } from "@/lib/llm/openai";

export type ModelConfig = {
  provider: "ollama" | "openai";
  model: string;
  apiKey?: string;
};

export async function callLLM(
  prompt: string,
  config: ModelConfig
): Promise<string> {
  if (config.provider === "ollama") {
    return callDeepSeek(prompt, config.model);
  }

  if (config.provider === "openai") {
    if (!config.apiKey) {
      throw new Error("OpenAI API key missing");
    }
    return callOpenAI(prompt, config.model, config.apiKey);
  }

  throw new Error("Unsupported model provider");
}
