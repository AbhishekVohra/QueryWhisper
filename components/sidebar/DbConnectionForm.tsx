"use client";

import { useEffect, useState } from "react";
import {
  loadRecentDbs,
  saveRecentDb,
  RecentDbConnection,
} from "@/lib/db/recentConnections";

type Props = {
  onConnected: (connection: any) => void;
};

export default function DbConnectionForm({
  onConnected,
}: Props) {
  const [form, setForm] = useState({
    host: "localhost",
    port: 5432,
    database: "",
    user: "",
    password: "",
  });

  const [status, setStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [recent, setRecent] = useState<
    RecentDbConnection[]
  >([]);

  useEffect(() => {
    setRecent(loadRecentDbs());
  }, []);

  async function connect() {
    const res = await fetch("/api/db/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setStatus("success");

      saveRecentDb({
        host: form.host,
        port: form.port,
        database: form.database,
        label: `${form.database}@${form.host}`,
      });

      setRecent(loadRecentDbs());
      onConnected(form);
    } else {
      setStatus("error");
    }
  }

  function selectRecent(conn: RecentDbConnection) {
    setForm((prev) => ({
      ...prev,
      host: conn.host,
      port: conn.port,
      database: conn.database,
      user: "",
      password: "",
    }));
  }

  return (
    <div className="space-y-4">
      {/* QUICK RECONNECT */}
      {recent.length > 0 && (
        <div className="bg-gray-50 border rounded p-3">
          <div className="text-xs font-semibold uppercase text-gray-500 mb-2">
            Quick Reconnect
          </div>

          <div className="space-y-2">
            {recent.map((c) => (
              <button
                key={c.id}
                onClick={() => selectRecent(c)}
                className="w-full text-left px-3 py-2 border rounded bg-white hover:bg-gray-100 text-sm"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CONNECTION FORM */}
      <div className="space-y-2">
        <input
          className="w-full p-2 border rounded text-black"
          placeholder="Host"
          value={form.host}
          onChange={(e) =>
            setForm({
              ...form,
              host: e.target.value,
            })
          }
        />

        <input
          className="w-full p-2 border rounded text-black"
          placeholder="Port"
          value={form.port}
          onChange={(e) =>
            setForm({
              ...form,
              port: Number(e.target.value),
            })
          }
        />

        <input
          className="w-full p-2 border rounded text-black"
          placeholder="Database"
          value={form.database}
          onChange={(e) =>
            setForm({
              ...form,
              database: e.target.value,
            })
          }
        />

        <input
          className="w-full p-2 border rounded text-black"
          placeholder="User"
          value={form.user}
          onChange={(e) =>
            setForm({
              ...form,
              user: e.target.value,
            })
          }
        />

        <input
          className="w-full p-2 border rounded text-black"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button
          onClick={connect}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Connect
        </button>

        {status === "success" && (
          <div className="text-green-600 text-sm">
            Connected
          </div>
        )}

        {status === "error" && (
          <div className="text-red-600 text-sm">
            Connection failed
          </div>
        )}
      </div>
    </div>
  );
}
