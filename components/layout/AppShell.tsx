"use client"

import { useWebSocket } from "@/app/_hooks/use-websocket";
import { CommandMenu } from "../CommandMenu";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
    useWebSocket();
    return (
        <>
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    {/* The 'children' here is the actual page component */}
                    {children} 
                </div>
            </div>
            <CommandMenu />
        </>
    )
}