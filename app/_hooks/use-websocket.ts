"use client"

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ActivityEvent } from "@/components/dashboard/recent-activity-feed";

// The hook now accepts a callback
export function useWebSocket(onPipelineUpdate?: (event: ActivityEvent) => void) {
    const queryClient = useQueryClient();

    useEffect(() => {
        const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081/ws';
        const ws = new WebSocket(WS_URL);
        ws.onopen = () => console.log('WebSocket Connected');
        ws.onclose = () => console.log('WebSocket Disconnected');

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            
            if (message.type === 'PROJECT_ADDED') {
                queryClient.invalidateQueries({ queryKey: ['projects'] });
            }
            
            // Handle the new event type
            if (message.type === 'PIPELINE_UPDATE' && typeof onPipelineUpdate === 'function') {
                onPipelineUpdate(message.payload);
            }
        };

        return () => ws.close();
    }, [queryClient, onPipelineUpdate]); // Add the callback to the dependency array
}