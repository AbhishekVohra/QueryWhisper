"use client";

import { useState } from "react";

import Sidebar from "@/components/sidebar/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { ModelConfig } from "@/lib/llm/router";

export default function Home() {
  const [schema, setSchema] = useState<any>(null);
  const [metadata, setMetadata] = useState("");
  const [connection, setConnection] =
    useState<any>(null);

  const [modelConfig, setModelConfig] =
    useState<ModelConfig>({
      provider: "ollama",
      model: "deepseek-coder:6.7b-instruct-q4_K_M",
    });

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
      />

      <ChatWindow
        schema={schema}
        metadata={metadata}
        connection={connection}
        modelConfig={modelConfig}
      />
    </div>
  );
}
