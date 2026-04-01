export interface User {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  owner: User;
  members: ProjectMember[];
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface ProjectMember {
  id: number;
  userId: number;
  projectId: number;
  role: string;
  createdAt: string;
  user: User;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  startDate?: string | null;
  dueDate?: string | null;
  projectId: number;
  assigneeId?: number | null;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
  project?: { id: number; name: string };
}

export interface DashboardStats {
  totalProjects: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
}

export interface Teammate {
  id: number;
  name: string;
  email: string;
  projects: { id: number; name: string; role: string }[];
}
