'use client'
import { Activity, CreditCard, DollarSign, FolderKanban } from 'lucide-react';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { getProjects, Project } from "@/app/_lib/api";
import { useQuery } from '@tanstack/react-query';
import { RecentActivityFeed, ActivityEvent } from "@/components/dashboard/recent-activity-feed";
import { useState } from 'react';
import { useWebSocket } from './_hooks/use-websocket';
import { ServiceHealth } from "@/components/dashboard/service-health";

export default function HomePage() {
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);

  // The callback that will be passed to the hook
  const handlePipelineUpdate = (newEvent: ActivityEvent) => {
      // Add the new event to the beginning of the list
      setActivityEvents(prevEvents => [newEvent, ...prevEvents]);
  };

  // Pass the callback to our WebSocket hook
  useWebSocket(handlePipelineUpdate);
  // Use the useQuery hook
  const { data: projects, isLoading, isError } = useQuery<Project[]>({
    queryKey: ['projects'], // A unique key for this query
    queryFn: getProjects,
  });

  const projectCount = projects?.length ?? 0;
  const projectCountDisplay = isLoading ? "..." : projectCount.toString();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <DashboardCard 
          title="Active Projects"
          icon={FolderKanban}
          value={projectCountDisplay} // <-- DYNAMIC VALUE
          description={isError ? "Could not load data" : "+0 since last month"}
        />
        <DashboardCard 
          title="Successful Deployments"
          icon={Activity}
          value="521"
          description="99.8% success rate"
        />
        <DashboardCard 
          title="Secrets Managed"
          icon={CreditCard} // Using CreditCard as a stand-in for secrets
          value="243"
          description="Across 12 projects"
        />
        <DashboardCard 
          title="Monthly Cost"
          icon={DollarSign}
          value="$1,234.56"
          description="Forecasted from usage"
        />
      </div>

      
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <RecentActivityFeed events={activityEvents} />
        <ServiceHealth />
      </div>
    </main>
  );
}