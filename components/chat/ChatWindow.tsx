"use client";

import { useState } from "react";

type Message =
  | { role: "user"; content: string }
  | {
      role: "assistant";
      explanation: string;
      sql: string;
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
};

export default function ChatWindow({
  schema,
  metadata,
  connection,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<QueryResult | null>(null);
  const [execError, setExecError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    if (!schema) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          explanation:
            "Please connect to a database first.",
          sql: "",
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
    ]);

    setInput("");
    setLoading(true);
    setResult(null);
    setExecError(null);

    try {
      const res = await fetch("/api/llm/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          schema,
          metadata,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          explanation: data.explanation || "",
          sql: data.sql || "",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function runQuery(sql: string) {
    if (!connection) {
      setExecError(
        "No database connection available."
      );
      return;
    }

    setExecuting(true);
    setExecError(null);

    try {
      const res = await fetch("/api/db/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql,
          connection,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err: any) {
      setExecError(err.message);
      setResult(null);
    } finally {
      setExecuting(false);
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
            <div key={i} className="space-y-3">
              {msg.explanation && (
                <div className="bg-gray-100 p-4 rounded">
                  <strong>Explanation:</strong>
                  <div className="mt-1">
                    {msg.explanation}
                  </div>
                </div>
              )}

              {msg.sql && (
                <>
                  <pre className="bg-black text-green-400 p-4 rounded text-sm overflow-x-auto">
                    {msg.sql}
                  </pre>

                  <button
                    onClick={() => runQuery(msg.sql)}
                    disabled={executing}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    {executing
                      ? "Running…"
                      : "Run Query"}
                  </button>
                </>
              )}
            </div>
          )
        )}

        {loading && (
          <div className="text-gray-600">
            QueryWhisper is thinking…
          </div>
        )}

        {execError && (
          <div className="text-red-600">
            {execError}
          </div>
        )}

        {result && (
          <div className="mt-6">
            <div className="mb-2 text-sm">
              Rows: {result.rowCount}
            </div>

            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    {result.columns.map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 text-left"
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
                      className="border-t"
                    >
                      {result.columns.map((col) => (
                        <td
                          key={col}
                          className="px-3 py-2"
                        >
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4 flex gap-2">
        <input
          className="flex-1 p-3 border rounded text-black"
          placeholder="Ask a question about your data…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && sendMessage()
          }
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
