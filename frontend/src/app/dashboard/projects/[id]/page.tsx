'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Project, Task, ProjectMember } from '@/lib/types';

const STATUS_COLUMNS = [
  { key: 'todo' as const, label: 'Yapılacaklar', color: 'bg-slate-400', gradient: 'from-slate-400 to-slate-500', bgColor: 'bg-slate-500/5' },
  { key: 'in-progress' as const, label: 'Devam Edenler', color: 'bg-amber-400', gradient: 'from-amber-400 to-orange-500', bgColor: 'bg-amber-500/5' },
  { key: 'done' as const, label: 'Bitenler', color: 'bg-emerald-400', gradient: 'from-emerald-400 to-teal-500', bgColor: 'bg-emerald-500/5' },
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
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold text-white">{project.name}</h1>
          {project.description && <p className="text-slate-400 text-sm mt-2">{project.description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2.5 glass border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Davet Et
          </button>
          <button
            onClick={() => { setNewTaskStatus('todo'); setShowCreateTask(true); }}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-accent-purple text-white font-semibold rounded-xl transition-all hover:shadow-glow hover:scale-[1.02] active:scale-95 flex items-center gap-2 text-sm btn-shine"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Görev
          </button>
        </div>
      </div>

      {/* Members bar */}
      <div className="flex items-center gap-4 glass rounded-xl p-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm text-slate-400 font-medium">Ekip:</span>
        </div>
        <div className="flex -space-x-2">
          {members.map(m => (
            <div key={m.id} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-xs text-white font-bold border-2 border-dark-card hover:scale-110 transition-transform cursor-default" title={`${m.user.name} (${m.role})`}>
              {m.user.name.charAt(0)}
            </div>
          ))}
        </div>
        <span className="text-xs text-slate-500">{members.length} üye</span>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {STATUS_COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="glass rounded-2xl overflow-hidden">
              <div className={`px-5 py-4 border-b border-white/5 flex items-center justify-between ${col.bgColor}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${col.gradient} ring-4 ring-white/5`} />
                  <h3 className="font-bold text-white text-sm">{col.label}</h3>
                  <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full font-medium">{colTasks.length}</span>
                </div>
                <button
                  onClick={() => { setNewTaskStatus(col.key); setShowCreateTask(true); }}
                  className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/10 transition-all"
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
                    className="bg-white/[0.03] rounded-xl p-4 border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer group"
                    onDoubleClick={() => handleEditTask(task)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white flex-1">{task.title}</h4>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {task.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{task.description}</p>}

                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        task.priority === 'high' ? 'bg-accent-rose/15 text-accent-rose' :
                        task.priority === 'medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-500/15 text-slate-400'
                      }`}>
                        {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                      </span>
                      {task.assignee && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-[10px] text-white font-bold shadow-md" title={task.assignee.name}>
                          {task.assignee.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-slate-500">{new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}

                    {/* Quick status buttons */}
                    <div className="flex gap-1.5 mt-3 pt-3 border-t border-white/5">
                      {STATUS_COLUMNS.filter(s => s.key !== task.status).map(s => (
                        <button
                          key={s.key}
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(task.id, s.key); }}
                          className="flex-1 text-[10px] py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white hover:bg-white/[0.08] hover:border-white/10 transition-all font-medium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowCreateTask(false)} />
          <div className="relative glass-strong rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-fade-in-scale border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <h2 className="text-xl font-bold text-white">Yeni Görev Oluştur</h2>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Başlık</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
                  placeholder="Görev başlığı"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all resize-none"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bitiş</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateTask(false)} className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-all font-medium">
                  İptal
                </button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-brand-500 to-accent-purple text-white font-semibold rounded-xl transition-all hover:shadow-glow btn-shine">
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setEditingTask(null)} />
          <div className="relative glass-strong rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-fade-in-scale border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-white">Görevi Düzenle</h2>
            </div>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Başlık</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Açıklama</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Durum</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bitiş</label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingTask(null)} className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-all font-medium">
                  İptal
                </button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-brand-500 to-accent-purple text-white font-semibold rounded-xl transition-all hover:shadow-glow btn-shine">
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowInvite(false)} />
          <div className="relative glass-strong rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fade-in-scale border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-white">Üye Davet Et</h2>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              {inviteError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {inviteError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">E-posta Adresi</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                  placeholder="kullanici@email.com"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInvite(false)} className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-all font-medium">
                  İptal
                </button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-brand-500 to-accent-purple text-white font-semibold rounded-xl transition-all hover:shadow-glow btn-shine">
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
