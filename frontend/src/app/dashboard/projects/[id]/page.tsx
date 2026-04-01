'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Project, Task, ProjectMember } from '@/lib/types';

const STATUS_COLUMNS = [
  { key: 'todo' as const, label: 'Yapılacaklar', color: 'bg-slate-500', bgColor: 'bg-slate-500/10' },
  { key: 'in-progress' as const, label: 'Devam Edenler', color: 'bg-amber-500', bgColor: 'bg-amber-500/10' },
  { key: 'done' as const, label: 'Bitenler', color: 'bg-emerald-500', bgColor: 'bg-emerald-500/10' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Düşük', color: 'bg-slate-500/20 text-slate-400' },
  { value: 'medium', label: 'Orta', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'high', label: 'Yüksek', color: 'bg-red-500/20 text-red-400' },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Create task state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<string>('todo');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', startDate: '', dueDate: '', assigneeId: '' });

  // Edit task state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', priority: '', startDate: '', dueDate: '', assigneeId: '', status: '' });

  // Invite state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  const loadData = async () => {
    try {
      const [p, t, m] = await Promise.all([
        api.projects.get(projectId),
        api.tasks.byProject(projectId),
        api.members.byProject(projectId),
      ]);
      setProject(p);
      setTasks(t);
      setMembers(m);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.tasks.create({
        ...newTask,
        status: newTaskStatus,
        projectId,
        assigneeId: newTask.assigneeId ? Number(newTask.assigneeId) : null,
        startDate: newTask.startDate || null,
        dueDate: newTask.dueDate || null,
      });
      setNewTask({ title: '', description: '', priority: 'medium', startDate: '', dueDate: '', assigneeId: '' });
      setShowCreateTask(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.tasks.updateStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      startDate: task.startDate ? task.startDate.split('T')[0] : '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assigneeId: task.assigneeId ? String(task.assigneeId) : '',
      status: task.status,
    });
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      await api.tasks.update(editingTask.id, {
        ...editForm,
        assigneeId: editForm.assigneeId ? Number(editForm.assigneeId) : null,
        startDate: editForm.startDate || null,
        dueDate: editForm.dueDate || null,
      });
      setEditingTask(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await api.tasks.delete(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    try {
      await api.members.invite({ email: inviteEmail, projectId });
      setInviteEmail('');
      setShowInvite(false);
      loadData();
    } catch (err: any) {
      setInviteError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!project) {
    return <p className="text-slate-400">Proje bulunamadı</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          {project.description && <p className="text-slate-400 text-sm mt-1">{project.description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 bg-dark-card border border-dark-border text-slate-300 rounded-xl hover:bg-dark-hover transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Davet Et
          </button>
          <button
            onClick={() => { setNewTaskStatus('todo'); setShowCreateTask(true); }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Görev
          </button>
        </div>
      </div>

      {/* Members bar */}
      <div className="flex items-center gap-3 bg-dark-card rounded-xl p-4 border border-dark-border">
        <span className="text-sm text-slate-400">Ekip:</span>
        <div className="flex -space-x-2">
          {members.map(m => (
            <div key={m.id} className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs text-white font-bold border-2 border-dark-card" title={`${m.user.name} (${m.role})`}>
              {m.user.name.charAt(0)}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {STATUS_COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
              <div className={`px-5 py-4 border-b border-dark-border flex items-center justify-between ${col.bgColor}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${col.color}`} />
                  <h3 className="font-semibold text-white text-sm">{col.label}</h3>
                  <span className="text-xs text-slate-400 bg-dark-bg/50 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <button
                  onClick={() => { setNewTaskStatus(col.key); setShowCreateTask(true); }}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-dark-hover/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <div className="p-3 space-y-3 min-h-[200px]">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-dark-bg rounded-xl p-4 border border-dark-border hover:border-dark-hover transition-all cursor-pointer group"
                    onDoubleClick={() => handleEditTask(task)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-white flex-1">{task.title}</h4>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {task.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{task.description}</p>}

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                      </span>
                      {task.assignee && (
                        <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-[10px] text-white font-bold" title={task.assignee.name}>
                          {task.assignee.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {task.dueDate && (
                      <p className="text-xs text-slate-500 mt-2">
                        📅 {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                      </p>
                    )}

                    {/* Quick status buttons */}
                    <div className="flex gap-1 mt-3 pt-3 border-t border-dark-border">
                      {STATUS_COLUMNS.filter(s => s.key !== task.status).map(s => (
                        <button
                          key={s.key}
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, s.key); }}
                          className="flex-1 text-[10px] py-1.5 rounded-lg bg-dark-card border border-dark-border text-slate-400 hover:text-white hover:border-dark-hover transition-all"
                        >
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateTask(false)} />
          <div className="relative bg-dark-card rounded-2xl p-8 w-full max-w-lg border border-dark-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Yeni Görev Oluştur</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Başlık</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  placeholder="Görev başlığı"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
                  placeholder="Görev açıklaması"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Öncelik</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  >
                    {PRIORITY_OPTIONS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Atanan Kişi</label>
                  <select
                    value={newTask.assigneeId}
                    onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  >
                    <option value="">Atanmamış</option>
                    {members.map(m => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Başlangıç</label>
                  <input
                    type="date"
                    value={newTask.startDate}
                    onChange={e => setNewTask({ ...newTask, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bitiş</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateTask(false)} className="flex-1 py-3 bg-dark-bg border border-dark-border text-slate-300 rounded-xl hover:bg-dark-hover transition-colors">
                  İptal
                </button>
                <button type="submit" className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingTask(null)} />
          <div className="relative bg-dark-card rounded-2xl p-8 w-full max-w-lg border border-dark-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Görevi Düzenle</h2>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Başlık</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Durum</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  >
                    {STATUS_COLUMNS.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Öncelik</label>
                  <select
                    value={editForm.priority}
                    onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  >
                    {PRIORITY_OPTIONS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Atanan Kişi</label>
                  <select
                    value={editForm.assigneeId}
                    onChange={e => setEditForm({ ...editForm, assigneeId: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  >
                    <option value="">Atanmamış</option>
                    {members.map(m => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Başlangıç</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bitiş</label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingTask(null)} className="flex-1 py-3 bg-dark-bg border border-dark-border text-slate-300 rounded-xl hover:bg-dark-hover transition-colors">
                  İptal
                </button>
                <button type="submit" className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInvite(false)} />
          <div className="relative bg-dark-card rounded-2xl p-8 w-full max-w-md border border-dark-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Üye Davet Et</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              {inviteError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {inviteError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">E-posta Adresi</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  placeholder="kullanici@email.com"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInvite(false)} className="flex-1 py-3 bg-dark-bg border border-dark-border text-slate-300 rounded-xl hover:bg-dark-hover transition-colors">
                  İptal
                </button>
                <button type="submit" className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors">
                  Davet Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
