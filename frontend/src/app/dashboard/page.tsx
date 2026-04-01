'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { DashboardStats, Project, Task } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.projects.stats(),
      api.projects.list(),
      api.tasks.all(),
    ])
      .then(([s, p, t]) => {
        setStats(s);
        setProjects(p);
        setRecentTasks(t.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Aktif Projeler',
      value: stats?.totalProjects || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Bekleyen Görevler',
      value: stats?.todoTasks || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Devam Edenler',
      value: stats?.inProgressTasks || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Tamamlanan',
      value: stats?.doneTasks || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Hoş geldin, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">İşte projelerinin genel durumu</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(card => (
          <div key={card.label} className="bg-dark-card rounded-2xl p-6 border border-dark-border hover:border-dark-hover transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-slate-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="bg-dark-card rounded-2xl border border-dark-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Projeler</h2>
            <Link href="/dashboard/projects" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
              Tümünü Gör →
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-slate-500 text-sm">Henüz proje yok</p>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map(project => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-dark-bg/50 hover:bg-dark-hover/30 border border-transparent hover:border-dark-border transition-all"
                >
                  <div>
                    <p className="font-medium text-white">{project.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{project._count?.tasks || 0} görev</p>
                  </div>
                  <div className="flex -space-x-2">
                    {project.members?.slice(0, 3).map(m => (
                      <div key={m.id} className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs text-white font-bold border-2 border-dark-card">
                        {m.user.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="bg-dark-card rounded-2xl border border-dark-border p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Son Görevler</h2>
          {recentTasks.length === 0 ? (
            <p className="text-slate-500 text-sm">Henüz görev yok</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-dark-bg/50 border border-transparent hover:border-dark-border transition-all"
                >
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    task.status === 'done' ? 'bg-emerald-500' :
                    task.status === 'in-progress' ? 'bg-amber-500' : 'bg-slate-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.project?.name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
