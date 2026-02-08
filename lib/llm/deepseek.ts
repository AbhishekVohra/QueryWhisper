export async function callDeepSeek(
  prompt: string,
  model = "deepseek-coder"
): Promise<string> {
  // 🔒 Sanitize model name
  const safeModel = model.trim();

  const res = await fetch(
    "http://localhost:11434/api/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: safeModel,
        prompt,
        stream: false,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Ollama request failed: ${res.status} - ${text}`
    );
  }

  const json = await res.json();
  return json.response;
}
