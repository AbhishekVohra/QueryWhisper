"use client";

import { useEffect, useState } from "react";
import { ModelConfig } from "@/lib/llm/router";
import {
  loadHistory,
  saveHistory,
} from "@/lib/history/storage";
import { ChatHistoryItem } from "@/lib/history/types";

type Message =
  | { role: "user"; content: string }
  | {
      role: "assistant";
      explanation?: string;
      sql?: string;
      analysis?: string;
    };

type QueryResult = {
  columns: string[];
  rows: any[];
  rowCount: number;
};

type ChatWindowProps = {
  schema: any;
  metadata: string;
  connection: any;
  modelConfig: ModelConfig;

  onHistoryUpdate: (
    history: ChatHistoryItem[]
  ) => void;
  restoreItem: ChatHistoryItem | null;
};

function ThinkingIndicator() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="italic text-gray-600">
      QueryWhisper is thinking{dots}
    </div>
  );
}

export default function ChatWindow({
  schema,
  metadata,
  connection,
  modelConfig,
  onHistoryUpdate,
  restoreItem,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<"query" | "analysis">(
    "query"
  );

  const [history, setHistory] = useState<
    ChatHistoryItem[]
  >([]);

  const [result, setResult] =
    useState<QueryResult | null>(null);
  const [execError, setExecError] =
    useState<string | null>(null);
  const [executing, setExecuting] =
    useState(false);

  // Load history on mount
  useEffect(() => {
    const h = loadHistory();
    setHistory(h);
    onHistoryUpdate(h);
  }, []);

  // Restore from sidebar click
  useEffect(() => {
    if (!restoreItem) return;

    setMessages([
      {
        role: "user",
        content: restoreItem.question,
      },
      {
        role: "assistant",
        explanation: restoreItem.explanation,
        sql: restoreItem.sql,
      },
    ]);
  }, [restoreItem]);

  async function sendQuery() {
    if (!input.trim() || loading) return;

    setMode("query");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
    ]);

    const question = input;
    setInput("");
    setLoading(true);
    setExecError(null);
    setResult(null);

    try {
      const res = await fetch("/api/llm/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          schema,
          metadata,
          modelConfig,
        }),
      });

      const data = await res.json();

      const item: ChatHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        question,
        explanation: data.explanation || "",
        sql: data.sql || "",
      };

      const updated = [item, ...history].slice(0, 50);
      setHistory(updated);
      saveHistory(updated);
      onHistoryUpdate(updated);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          explanation: item.explanation,
          sql: item.sql,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function runQuery(sql: string) {
    if (!connection) {
      setExecError("No database connection available.");
      return;
    }

    setExecuting(true);
    setExecError(null);

    try {
      const res = await fetch("/api/db/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql,
          connection,
          schema,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data);
      setMode("analysis"); // 🔑 analysis now unlocked
    } catch (err: any) {
      setExecError(err.message);
      setResult(null);
    } finally {
      setExecuting(false);
    }
  }

  async function analyzeResult() {
    if (!result || loading) return;

    setLoading(true);

    const rowsForAnalysis =
      result.rows.length <= 100
        ? result.rows
        : [
            ...result.rows.slice(0, 50),
            ...result.rows.slice(-50),
          ];

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question:
            input ||
            "Provide key insights from this data.",
          result: {
            columns: result.columns,
            rowCount: result.rowCount,
            rows: rowsForAnalysis,
          },
          metadata,
          modelConfig,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          analysis: data.analysis,
        },
      ]);

      setInput("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-6 overflow-y-auto space-y-6 text-black">
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="text-right">
              <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded">
                {msg.content}
              </div>
            </div>
          ) : (
            <div
              key={i}
              className="bg-gray-100 p-4 rounded space-y-3"
            >
              {msg.explanation && (
                <div>
                  <strong>Explanation:</strong>
                  <div>{msg.explanation}</div>
                </div>
              )}

              {msg.sql && (
                <>
                  <pre className="bg-black text-green-400 p-3 rounded text-sm overflow-x-auto">
                    {msg.sql}
                  </pre>

                  <button
                    onClick={() => runQuery(msg.sql!)}
                    disabled={executing}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    {executing ? "Running…" : "Run Query"}
                  </button>
                </>
              )}

              {msg.analysis && (
                <div>
                  <strong>Analysis:</strong>
                  <div className="whitespace-pre-wrap">
                    {msg.analysis}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {loading && <ThinkingIndicator />}

        {execError && (
          <div className="text-red-600">{execError}</div>
        )}

        {result && (
          <>
            <div className="mt-6 border rounded bg-white">
              <div className="px-4 py-2 border-b bg-gray-50 text-sm">
                Rows returned:{" "}
                <strong>{result.rowCount}</strong>
              </div>

              <div className="overflow-auto max-h-[400px]">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="sticky top-0 bg-gray-200">
                    <tr>
                      {result.columns.map((col) => (
                        <th
                          key={col}
                          className="px-3 py-2 text-left border-b"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="odd:bg-gray-50"
                      >
                        {result.columns.map((col) => (
                          <td
                            key={col}
                            className="px-3 py-2 border-b"
                          >
                            {row[col] === null
                              ? "null"
                              : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* INPUT BAR WITH EXPLICIT MODE BUTTONS */}
      <div className="border-t p-4 flex gap-2">
        <input
          className="flex-1 p-3 border rounded text-black"
          placeholder={
            mode === "analysis"
              ? "Ask about this data…"
              : "Ask a new query…"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={sendQuery}
          className="bg-blue-600 text-white px-4 rounded"
        >
          New Query
        </button>

        <button
          onClick={analyzeResult}
          disabled={!result}
          className={`px-4 rounded text-white ${
            result
              ? "bg-purple-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Analysis
        </button>
      </div>
    </div>
  );
}
