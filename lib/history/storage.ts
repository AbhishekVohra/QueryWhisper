import { ChatHistoryItem } from "./types";

const KEY = "querywhisper.chat.history";

export function loadHistory(): ChatHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(
  history: ChatHistoryItem[]
) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(history));
}
