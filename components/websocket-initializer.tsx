// components/websocket-initializer.tsx
"use client"

import { useWebSocket } from "@/app/_hooks/use-websocket";

export function WebSocketInitializer() {
  // This hook will now run once in the layout and establish the connection.
  useWebSocket();
  
  // This component renders nothing. It's just for running the hook.
  return null;
}