"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function Home() {
  const [schema, setSchema] = useState<any>(null);
  const [metadata, setMetadata] = useState("");
  const [connection, setConnection] = useState<any>(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        schema={schema}
        onSchemaChange={setSchema}
        metadata={metadata}
        onMetadataChange={setMetadata}
        onConnection={setConnection}
      />

      <ChatWindow
        schema={schema}
        metadata={metadata}
        connection={connection}
      />
    </div>
  );
}
