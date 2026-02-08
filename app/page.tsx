"use client";

import { useState } from "react";

import Sidebar from "@/components/sidebar/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";

import { ModelConfig } from "@/lib/llm/router";
import { ChatHistoryItem } from "@/lib/history/types";

export default function Home() {
  const [schema, setSchema] = useState<any>(null);
  const [metadata, setMetadata] = useState("");
  const [connection, setConnection] =
    useState<any>(null);

  const [modelConfig, setModelConfig] =
    useState<ModelConfig>({
      provider: "ollama",
      model:
        "deepseek-coder:6.7b-instruct-q4_K_M",
    });

  const [history, setHistory] = useState<
    ChatHistoryItem[]
  >([]);
  const [restoreItem, setRestoreItem] =
    useState<ChatHistoryItem | null>(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        schema={schema}
        onSchemaChange={setSchema}
        metadata={metadata}
        onMetadataChange={setMetadata}
        onConnection={setConnection}
        modelConfig={modelConfig}
        onModelChange={setModelConfig}
        history={history}
        onSelectHistory={setRestoreItem}
      />

      <ChatWindow
        schema={schema}
        metadata={metadata}
        connection={connection}
        modelConfig={modelConfig}
        onHistoryUpdate={setHistory}
        restoreItem={restoreItem}
      />
    </div>
  );
}
