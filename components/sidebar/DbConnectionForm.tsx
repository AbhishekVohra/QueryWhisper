"use client";

import { useState } from "react";

type Props = {
  onConnected: (connection: any) => void;
};

export default function DbConnectionForm({ onConnected }: Props) {
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

  async function connect() {
    const res = await fetch("/api/db/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setStatus("success");
      onConnected(form);
    } else {
      setStatus("error");
    }
  }

  return (
    <div>
      <h2 className="font-semibold mb-2">
        Database Connection
      </h2>

      {["host", "port", "database", "user", "password"].map(
        (field) => (
          <input
            key={field}
            className="w-full mb-2 p-2 border rounded text-black"
            placeholder={field}
            type={field === "password" ? "password" : "text"}
            value={(form as any)[field]}
            onChange={(e) =>
              setForm({
                ...form,
                [field]:
                  field === "port"
                    ? Number(e.target.value)
                    : e.target.value,
              })
            }
          />
        )
      )}

      <button
        onClick={connect}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Connect
      </button>

      {status === "success" && (
        <p className="text-green-600 mt-1">
          Connected
        </p>
      )}
      {status === "error" && (
        <p className="text-red-600 mt-1">
          Connection failed
        </p>
      )}
    </div>
  );
}
