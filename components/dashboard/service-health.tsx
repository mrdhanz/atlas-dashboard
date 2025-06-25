// components/dashboard/service-health.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface ServiceStatus {
  name: string;
  status: string | null;
}

const getHealthStatus = async (): Promise<ServiceStatus[]> => {
  const res = await fetch('http://localhost:8081/api/v1/health');
  if (!res.ok) throw new Error("Failed to fetch health status");
  return res.json();
};

export function ServiceHealth() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['serviceHealth'],
    queryFn: getHealthStatus,
    // This is the magic: poll the API every 5 seconds!
    refetchInterval: 5000, 
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading status...</p>}
        {error && <p className="text-sm text-red-500">Could not load services.</p>}
        {data?.map(service => (
          <div key={service.name} className="flex items-center justify-between">
            <span className="text-sm font-medium">{service.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground capitalize">
                {service.status ?? 'Offline'}
              </span>
              <div className={cn(
                "h-2.5 w-2.5 rounded-full",
                service.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
              )} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}