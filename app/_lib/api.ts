const API_BASE_URL = process.env.NEXT_PUBLIC_PROJECTS_API_URL;

export interface Project {
  id: number;
  name: string;
  repository_url: string;
  // ... other fields
}

export const getProjects = async (): Promise<Project[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/projects`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

export const addProject = async (project: { name: string; repository_url: string }): Promise<Project> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
    });
    if (!res.ok) {
        throw new Error('Failed to add project');
    }
    return res.json();
};