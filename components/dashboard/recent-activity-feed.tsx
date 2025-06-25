"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// This component will receive events as props from its parent
export interface ActivityEvent {
  projectName: string;
  status: 'success' | 'failure';
  commitMessage: string;
  timestamp: string;
}

interface RecentActivityFeedProps {
  events: ActivityEvent[];
}

export function RecentActivityFeed({ events }: RecentActivityFeedProps) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length === 0 && <p className="text-sm text-muted-foreground">No recent activity. Trigger a deployment to see events here.</p>}
        {events.map((event, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={cn(
              "h-2.5 w-2.5 rounded-full",
              event.status === 'success' ? 'bg-green-500' : 'bg-red-500'
            )} />
            <div className="grid gap-1 text-sm">
              <p className="font-medium">{event.projectName} - Build {event.status}</p>
              <p className="text-muted-foreground">{event.commitMessage}</p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {new Date(event.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}