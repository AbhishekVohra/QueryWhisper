"use client";

import { ModelConfig } from "@/lib/llm/router";

type Props = {
  value: ModelConfig;
  onChange: (config: ModelConfig) => void;
};

export default function ModelSelector({
  value,
  onChange,
}: Props) {
  return (
    <div>
      <h2 className="font-semibold mb-2">
        AI Model
      </h2>

      <select
        className="w-full p-2 border rounded text-black mb-2"
        value={value.provider}
        onChange={(e) =>
          onChange({
            provider: e.target.value as any,
            model:
              e.target.value === "openai"
                ? "gpt-4o-mini"
                : "deepseek-coder:6.7b-instruct-q4_K_M",
          })
        }
      >
        <option value="ollama">
          Local (Ollama)
        </option>
        <option value="openai">
          OpenAI
        </option>
      </select>

      {value.provider === "ollama" && (
        <>
          <input
            className="w-full p-2 border rounded text-black"
            placeholder="Ollama model name"
            value={value.model}
            onChange={(e) =>
              onChange({
                ...value,
                model: e.target.value.trim(), // 🔒 trim
              })
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: deepseek-coder:6.7b-instruct-q4_K_M
          </p>
        </>
      )}

      {value.provider === "openai" && (
        <>
          <input
            className="w-full p-2 border rounded text-black mb-2"
            placeholder="OpenAI model (e.g. gpt-4o-mini)"
            value={value.model}
            onChange={(e) =>
              onChange({
                ...value,
                model: e.target.value.trim(),
              })
            }
          />
          <input
            className="w-full p-2 border rounded text-black"
            type="password"
            placeholder="OpenAI API key"
            value={value.apiKey || ""}
            onChange={(e) =>
              onChange({
                ...value,
                apiKey: e.target.value.trim(),
              })
            }
          />
        </>
      )}
    </div>
  );
}
