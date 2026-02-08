"use client";

import { useEffect, useState } from "react";

type Column = {
  name: string;
  type: string;
};

type SchemaData = {
  [schemaName: string]: {
    [tableName: string]: Column[];
  };
};

type SchemaExplorerProps = {
  enabled?: boolean;
  onSchemaLoaded?: (schema: SchemaData) => void;
};

export default function SchemaExplorer({
  enabled,
  onSchemaLoaded,
}: SchemaExplorerProps) {
  const [schema, setSchema] = useState<SchemaData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    fetch("/api/db/schema")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch schema");
        return res.json();
      })
      .then((data) => {
        setSchema(data);
        onSchemaLoaded?.(data);
      })
      .catch((err) => setError(err.message));
  }, [enabled, onSchemaLoaded]);

  if (!enabled) {
    return (
      <div>
        <h2 className="font-semibold mb-2">Schema Explorer</h2>
        <p className="text-sm">
          Connect to a database to view schema.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-semibold mb-2">Schema Explorer</h2>

      {error && <p className="text-red-600">{error}</p>}

      {!schema && !error && <p>Loading schema…</p>}

      {schema && (
        <div className="text-sm space-y-4">
          {Object.entries(schema).map(
            ([schemaName, tables]) => (
              <div key={schemaName}>
                <div className="font-semibold">
                  {schemaName}
                </div>

                {Object.entries(tables).map(
                  ([tableName, columns]) => (
                    <div key={tableName} className="ml-2">
                      <div className="font-medium">
                        • {tableName}
                      </div>

                      <div className="ml-4">
                        {columns.map((col) => (
                          <div key={col.name}>
                            – {col.name} ({col.type})
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
