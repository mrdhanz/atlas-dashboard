"use client"

import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../_lib/api"; // We'll create this file next
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddProjectDialog } from "./_components/add-project-dialog";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Projects</h1>
            <AddProjectDialog />
        </div>
        {isLoading && <p>Loading projects...</p>}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map(project => (
                <Card key={project.id}>
                    <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{project.repository_url}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    </main>
  );
}