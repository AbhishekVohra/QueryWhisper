"use client";

import { ChatHistoryItem } from "@/lib/history/types";

type Props = {
  history: ChatHistoryItem[];
  onSelect: (item: ChatHistoryItem) => void;
};

export default function ChatHistory({
  history,
  onSelect,
}: Props) {
  if (history.length === 0) return null;

  return (
    <div>
      <h2 className="font-semibold mb-2">
        Chat History
      </h2>

      <div className="space-y-2">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left p-2 border rounded hover:bg-gray-100 text-sm"
          >
            <div className="truncate">
              {item.question}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(
                item.timestamp
              ).toLocaleString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
