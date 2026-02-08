"use client";

import { useState } from "react";

import DbConnectionForm from "./DbConnectionForm";
import SchemaExplorer from "./SchemaExplorer";
import MetadataEditor from "./MetadataEditor";
import ModelSelector from "./ModelSelector";
import ChatHistory from "./ChatHistory";

import { ModelConfig } from "@/lib/llm/router";
import { ChatHistoryItem } from "@/lib/history/types";

type SidebarProps = {
  schema: any;
  onSchemaChange: (schema: any) => void;

  metadata: string;
  onMetadataChange: (text: string) => void;

  onConnection: (connection: any) => void;

  modelConfig: ModelConfig;
  onModelChange: (config: ModelConfig) => void;

  history: ChatHistoryItem[];
  onSelectHistory: (item: ChatHistoryItem) => void;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase text-gray-500">
        {title}
      </div>
      {children}
    </div>
  );
}

export default function Sidebar({
  schema,
  onSchemaChange,
  metadata,
  onMetadataChange,
  onConnection,
  modelConfig,
  onModelChange,
  history,
  onSelectHistory,
}: SidebarProps) {
  const [connected, setConnected] = useState(false);

  return (
    <div className="w-80 border-r bg-white p-4 space-y-6 overflow-y-auto text-black">
      <h1 className="text-xl font-semibold">
        QueryWhisper
      </h1>

      {/* CHAT HISTORY */}
      <Section title="Chat History">
        <ChatHistory
          history={history}
          onSelect={onSelectHistory}
        />
      </Section>

      {/* DATABASE */}
      <Section title="Database">
        <DbConnectionForm
          onConnected={(connection) => {
            setConnected(true);
            onConnection(connection);
          }}
        />
      </Section>

      {/* SCHEMA */}
      <Section title="Schema">
        <SchemaExplorer
          enabled={connected}
          onSchemaLoaded={onSchemaChange}
        />
      </Section>

      {/* METADATA */}
      <Section title="Metadata">
        <MetadataEditor
          value={metadata}
          onChange={onMetadataChange}
        />
      </Section>

      {/* MODEL */}
      <Section title="AI Model">
        <ModelSelector
          value={modelConfig}
          onChange={onModelChange}
        />
      </Section>
    </div>
  );
}
