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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projeler</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} proje</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Proje
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative bg-dark-card rounded-2xl p-8 w-full max-w-md border border-dark-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Yeni Proje Oluştur</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Proje Adı</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  placeholder="Proje adını girin"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
                  placeholder="Proje açıklaması (opsiyonel)"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 bg-dark-bg border border-dark-border text-slate-300 rounded-xl hover:bg-dark-hover transition-colors">
                  İptal
                </button>
                <button type="submit" disabled={creating} className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {creating ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-card border border-dark-border mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-slate-400">Henüz proje yok. İlk projenizi oluşturun!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-dark-card rounded-2xl border border-dark-border p-6 hover:border-dark-hover transition-all group">
              <div className="flex items-start justify-between mb-4">
                <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                  )}
                </Link>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-dark-hover/50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Projeyi Sil"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <Link href={`/dashboard/projects/${project.id}`}>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-border">
                  <div className="flex -space-x-2">
                    {project.members?.slice(0, 4).map(m => (
                      <div key={m.id} className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs text-white font-bold border-2 border-dark-card" title={m.user.name}>
                        {m.user.name.charAt(0)}
                      </div>
                    ))}
                    {(project.members?.length || 0) > 4 && (
                      <div className="w-8 h-8 rounded-full bg-dark-hover flex items-center justify-center text-xs text-slate-300 font-bold border-2 border-dark-card">
                        +{project.members!.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{project._count?.tasks || 0} görev</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
