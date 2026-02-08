/**
 * Minimal Ollama client for DeepSeek Coder.
 */

const OLLAMA_URL = "http://127.0.0.1:11434";
const MODEL_NAME = "deepseek-coder:6.7b-instruct-q4_K_M"; // change if needed

type OllamaResponse = {
  response: string;
};

export async function callDeepSeek(
  prompt: string
): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      prompt,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Ollama request failed: ${res.status} - ${text}`
    );
  }

  const data: OllamaResponse = await res.json();
  return data.response;
}
