'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Project } from '@/lib/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadProjects = () => {
    api.projects.list()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProjects(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.projects.create({ name, description });
      setName('');
      setDescription('');
      setShowCreate(false);
      loadProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.projects.delete(id);
      loadProjects();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const projectColors = [
    'from-blue-500 to-cyan-400',
    'from-purple-500 to-pink-400',
    'from-emerald-500 to-teal-400',
    'from-amber-500 to-orange-400',
    'from-rose-500 to-pink-400',
    'from-indigo-500 to-blue-400',
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Projeler</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} proje mevcut</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-accent-purple text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-glow hover:scale-[1.02] active:scale-95 flex items-center gap-2 btn-shine"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Proje
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowCreate(false)} />
          <div className="relative glass-strong rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in-scale border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Yeni Proje Oluştur</h2>
            </div>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Proje Adı</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                  placeholder="Proje adını girin"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all resize-none"
                  placeholder="Proje açıklaması (opsiyonel)"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-all font-medium">
                  İptal
                </button>
                <button type="submit" disabled={creating} className="flex-1 py-3 bg-gradient-to-r from-brand-500 to-accent-purple text-white font-semibold rounded-xl transition-all hover:shadow-glow disabled:opacity-50 btn-shine">
                  {creating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Oluşturuluyor...
                    </span>
                  ) : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass mb-5">
            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-slate-400 text-lg font-medium">Henüz proje yok</p>
          <p className="text-slate-500 text-sm mt-1">İlk projenizi oluşturmak için yukarıdaki butona tıklayın</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {projects.map((project, index) => (
            <div key={project.id} className="glass rounded-2xl p-6 card-hover group relative overflow-hidden">
              {/* Color accent top */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${projectColors[index % projectColors.length]}`} />
              {/* Glow */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${projectColors[index % projectColors.length]} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-500`} />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${projectColors[index % projectColors.length]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {project.name.charAt(0)}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">{project.name}</h3>
                    </div>
                    {project.description && (
                      <p className="text-sm text-slate-400 line-clamp-2 ml-[52px]">{project.description}</p>
                    )}
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 text-slate-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Projeyi Sil"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <Link href={`/dashboard/projects/${project.id}`}>
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                    <div className="flex -space-x-2">
                      {project.members?.slice(0, 4).map(m => (
                        <div key={m.id} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-xs text-white font-bold border-2 border-dark-card" title={m.user.name}>
                          {m.user.name.charAt(0)}
                        </div>
                      ))}
                      {(project.members?.length || 0) > 4 && (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-300 font-bold border-2 border-dark-card">
                          +{project.members!.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 bg-white/5 px-2.5 py-1 rounded-lg font-medium">{project._count?.tasks || 0} görev</span>
                      <svg className="w-4 h-4 text-slate-600 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
