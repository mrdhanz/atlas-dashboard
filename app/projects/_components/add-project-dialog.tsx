"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProject } from "@/app/_lib/api";
import { useState } from "react";

export function AddProjectDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addProject,
    onSuccess: () => {
      // When the mutation is successful, invalidate the 'projects' query.
      // This will cause TanStack Query to re-fetch the data.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpen(false); // Close the dialog
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const repository_url = formData.get('repository_url') as string;
    mutation.mutate({ name, repository_url });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button>Add Project</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add a New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input id="name" name="name" required />
                </div>
                <div>
                    <Label htmlFor="repository_url">Repository URL</Label>
                    <Input id="repository_url" name="repository_url" required type="url"/>
                </div>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Adding...' : 'Add Project'}
                </Button>
            </form>
        </DialogContent>
    </Dialog>
  );
}