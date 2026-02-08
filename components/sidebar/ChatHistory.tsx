"use client";

import { useState } from "react";
import { ChatHistoryItem } from "@/lib/history/types";

type Props = {
  history: ChatHistoryItem[];
  onSelect: (item: ChatHistoryItem) => void;
};

export default function ChatHistory({
  history,
  onSelect,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0) return null;

  const topFive = history.slice(0, 5);
  const rest = history.slice(5);

  return (
    <div className="space-y-2">
      {topFive.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="w-full text-left p-2 border rounded hover:bg-gray-100 text-sm"
        >
          <div className="truncate font-medium">
            {item.question}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(item.timestamp).toLocaleString()}
          </div>
        </button>
      ))}

      {rest.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:underline"
          >
            {expanded
              ? "Hide older chats"
              : `Show ${rest.length} more`}
          </button>

          {expanded && (
            <div className="mt-2 space-y-2">
              {rest.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="w-full text-left p-2 border rounded hover:bg-gray-50 text-sm"
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
          )}
        </div>
      )}
    </div>
  );
}
