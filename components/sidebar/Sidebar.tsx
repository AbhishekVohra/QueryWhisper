"use client";

import React, { useState } from "react";

import DbConnectionForm from "./DbConnectionForm";
import SchemaExplorer from "./SchemaExplorer";
import MetadataEditor from "./MetadataEditor";
import ModelSelector from "./ModelSelector";

export type SidebarProps = {
  schema: any;
  onSchemaChange: (schema: any) => void;
  metadata: string;
  onMetadataChange: (text: string) => void;
  onConnection: (connection: any) => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  schema,
  onSchemaChange,
  metadata,
  onMetadataChange,
  onConnection,
}) => {
  const [connected, setConnected] = useState(false);

  return (
    <div className="w-80 border-r bg-white p-4 space-y-6 overflow-y-auto text-black">
      <h1 className="text-xl font-semibold">QueryWhisper</h1>

      <DbConnectionForm
        onConnected={(connection) => {
          setConnected(true);
          onConnection(connection);
        }}
      />

      <SchemaExplorer
        enabled={connected}
        onSchemaLoaded={onSchemaChange}
      />

      <MetadataEditor
        value={metadata}
        onChange={onMetadataChange}
      />

      <ModelSelector />
    </div>
  );
};

export default Sidebar;
