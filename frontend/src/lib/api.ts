const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Bir hata oluştu');
  }

  return res.json();
}

// Auth
export const api = {
  auth: {
    register: (data: { email: string; name: string; password: string }) =>
      request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<any>('/auth/me'),
  },

  projects: {
    list: () => request<any[]>('/projects'),
    get: (id: number) => request<any>(`/projects/${id}`),
    create: (data: { name: string; description?: string; logo?: string }) =>
      request<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { name?: string; description?: string; logo?: string }) =>
      request<any>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<any>(`/projects/${id}`, { method: 'DELETE' }),
    stats: () => request<any>('/projects/stats/dashboard'),
  },

  tasks: {
    byProject: (projectId: number) => request<any[]>(`/tasks/project/${projectId}`),
    all: () => request<any[]>('/tasks/all'),
    create: (data: any) =>
      request<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      request<any>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id: number, status: string) =>
      request<any>(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    delete: (id: number) =>
      request<any>(`/tasks/${id}`, { method: 'DELETE' }),
  },

  members: {
    invite: (data: { email: string; projectId: number; role?: string }) =>
      request<any>('/members/invite', { method: 'POST', body: JSON.stringify(data) }),
    byProject: (projectId: number) => request<any[]>(`/members/project/${projectId}`),
    teammates: () => request<any[]>('/members/teammates'),
    remove: (memberId: number) =>
      request<any>(`/members/${memberId}`, { method: 'DELETE' }),
  },

  upload: {
    logo: async (file: File): Promise<{ url: string }> => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch(`${API_BASE}/upload/logo`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Dosya yükleme hatası');
      }

      return res.json();
    },
  },
};
