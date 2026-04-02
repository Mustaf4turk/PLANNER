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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-400',
      bgGlow: 'bg-blue-500/10',
    },
    {
      label: 'Bekleyen Görevler',
      value: stats?.todoTasks || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-400',
      bgGlow: 'bg-amber-500/10',
    },
    {
      label: 'Devam Edenler',
      value: stats?.inProgressTasks || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-400',
      bgGlow: 'bg-purple-500/10',
    },
    {
      label: 'Tamamlanan',
      value: stats?.doneTasks || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-400',
      bgGlow: 'bg-emerald-500/10',
    },
  ];

  const totalTasks = (stats?.todoTasks || 0) + (stats?.inProgressTasks || 0) + (stats?.doneTasks || 0);
  const completionRate = totalTasks > 0 ? Math.round(((stats?.doneTasks || 0) / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="animate-fade-in">
          <p className="text-sm font-medium text-brand-400 mb-1">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-extrabold text-white">
            Hoş geldin, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-2">İşte projelerinin genel durumu</p>
        </div>
        {totalTasks > 0 && (
          <div className="glass rounded-2xl px-5 py-3 flex items-center gap-3 animate-fade-in">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#gradient)" strokeWidth="3" strokeDasharray={`${completionRate}, 100`} strokeLinecap="round" />
                <defs>
                  <linearGradient id="gradient"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{completionRate}%</span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Tamamlanma</p>
              <p className="text-sm font-semibold text-white">{stats?.doneTasks}/{totalTasks}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {statCards.map(card => (
          <div key={card.label} className="glass rounded-2xl p-6 card-hover group relative overflow-hidden">
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${card.bgGlow} blur-2xl group-hover:scale-150 transition-transform duration-500`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg`}>
                  {card.icon}
                </div>
                <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-4xl font-extrabold text-white tracking-tight">{card.value}</p>
              <p className="text-sm text-slate-400 mt-1 font-medium">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="glass rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">Projeler</h2>
            </div>
            <Link href="/dashboard/projects" className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors flex items-center gap-1">
              Tümünü Gör
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">Henüz proje yok</p>
            </div>
          ) : (
            <div className="space-y-2 stagger-children">
              {projects.slice(0, 5).map(project => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    {project.logo ? (
                      project.logo.startsWith('/uploads/') || project.logo.startsWith('http') ? (
                        <img src={project.logo} alt={project.name} className="w-10 h-10 rounded-xl object-cover shadow-md ring-1 ring-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-md ring-1 ring-white/10">
                          {project.logo}
                        </div>
                      )
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-purple/20 flex items-center justify-center text-brand-400 font-bold text-sm">
                        {project.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white group-hover:text-brand-300 transition-colors">{project.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{project._count?.tasks || 0} görev</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {project.members?.slice(0, 3).map(m => (
                        <div key={m.id} className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-[10px] text-white font-bold border-2 border-dark-card">
                          {m.user.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="glass rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Son Görevler</h2>
          </div>
          {recentTasks.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">Henüz görev yok</p>
            </div>
          ) : (
            <div className="space-y-2 stagger-children">
              {recentTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all duration-300"
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ring-4 ${
                    task.status === 'done' ? 'bg-emerald-400 ring-emerald-400/20' :
                    task.status === 'in-progress' ? 'bg-amber-400 ring-amber-400/20' : 'bg-slate-400 ring-slate-400/20'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-white'}`}>{task.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{task.project?.name}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                    task.priority === 'high' ? 'bg-accent-rose/15 text-accent-rose' :
                    task.priority === 'medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-500/15 text-slate-400'
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
