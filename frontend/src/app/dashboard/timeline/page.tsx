'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Task } from '@/lib/types';

export default function TimelinePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tasks.all()
      .then(t => setTasks(t.filter(task => task.startDate || task.dueDate)))
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

  // Calculate timeline range
  const now = new Date();
  const dates = tasks.flatMap(t => [
    t.startDate ? new Date(t.startDate) : null,
    t.dueDate ? new Date(t.dueDate) : null,
  ]).filter(Boolean) as Date[];

  if (dates.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold text-white animate-fade-in">Zaman Çizelgesi</h1>
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass mb-5">
            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-400 text-lg font-medium">Tarih bilgisi olan görev bulunmuyor</p>
          <p className="text-slate-500 text-sm mt-1">Görevlere başlangıç ve bitiş tarihi ekleyin</p>
        </div>
      </div>
    );
  }

  const minDate = new Date(Math.min(...dates.map(d => d.getTime()), now.getTime()));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime()), now.getTime()));

  // Add padding
  minDate.setDate(minDate.getDate() - 3);
  maxDate.setDate(maxDate.getDate() + 7);

  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const dayWidth = Math.max(40, Math.min(60, 1200 / totalDays));

  const getDayOffset = (date: Date) => {
    return Math.floor((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Generate day headers
  const dayHeaders: { date: Date; label: string; isToday: boolean; isFirstOfMonth: boolean }[] = [];
  for (let i = 0; i <= totalDays; i++) {
    const d = new Date(minDate);
    d.setDate(d.getDate() + i);
    const isToday = d.toDateString() === now.toDateString();
    const isFirstOfMonth = d.getDate() === 1;
    dayHeaders.push({
      date: d,
      label: d.getDate().toString(),
      isToday,
      isFirstOfMonth,
    });
  }

  // Group tasks by project
  const tasksByProject = tasks.reduce((acc, task) => {
    const pName = task.project?.name || 'Proje Yok';
    if (!acc[pName]) acc[pName] = [];
    acc[pName].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const statusColor = (status: string) => {
    if (status === 'done') return 'bg-gradient-to-r from-emerald-500 to-teal-400';
    if (status === 'in-progress') return 'bg-gradient-to-r from-amber-500 to-orange-400';
    return 'bg-gradient-to-r from-brand-500 to-blue-400';
  };

  const statusDot = (status: string) => {
    if (status === 'done') return 'bg-emerald-400';
    if (status === 'in-progress') return 'bg-amber-400';
    return 'bg-brand-400';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-white animate-fade-in">Zaman Çizelgesi</h1>

      <div className="glass rounded-2xl overflow-x-auto animate-fade-in">
        <div style={{ minWidth: `${totalDays * dayWidth + 250}px` }}>
          {/* Header */}
          <div className="flex border-b border-white/5 sticky top-0 bg-dark-card/80 backdrop-blur-xl z-10">
            <div className="w-[250px] flex-shrink-0 px-4 py-3 border-r border-white/5">
              <span className="text-sm font-semibold text-slate-400">Görev</span>
            </div>
            <div className="flex">
              {dayHeaders.map((dh, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 text-center border-r border-white/5 py-2 ${
                    dh.isToday ? 'bg-brand-600/10' : ''
                  } ${dh.isFirstOfMonth ? 'border-l-2 border-l-brand-500/30' : ''}`}
                  style={{ width: `${dayWidth}px` }}
                >
                  {dh.isFirstOfMonth && (
                    <div className="text-[10px] text-brand-400 font-medium">
                      {dh.date.toLocaleDateString('tr-TR', { month: 'short' })}
                    </div>
                  )}
                  <div className={`text-xs ${dh.isToday ? 'text-brand-400 font-bold' : 'text-slate-500'}`}>
                    {dh.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {Object.entries(tasksByProject).map(([projectName, projectTasks]) => (
            <div key={projectName}>
              {/* Project Header */}
              <div className="flex border-b border-white/5 bg-white/[0.02]">
                <div className="w-[250px] flex-shrink-0 px-4 py-2.5 border-r border-white/5">
                  <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">{projectName}</span>
                </div>
                <div style={{ width: `${totalDays * dayWidth}px` }} />
              </div>

              {projectTasks.map(task => {
                const start = task.startDate ? new Date(task.startDate) : task.dueDate ? new Date(task.dueDate) : now;
                const end = task.dueDate ? new Date(task.dueDate) : task.startDate ? new Date(task.startDate) : now;
                const startOffset = getDayOffset(start);
                const duration = Math.max(1, getDayOffset(end) - startOffset + 1);

                return (
                  <div key={task.id} className="flex border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-[250px] flex-shrink-0 px-4 py-3 border-r border-white/5 flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(task.status)} ring-2 ring-white/5`} />
                      <span className="text-sm text-white truncate font-medium">{task.title}</span>
                    </div>
                    <div className="relative" style={{ width: `${totalDays * dayWidth}px`, height: '44px' }}>
                      {/* Today line */}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-brand-500/30 z-0"
                        style={{ left: `${getDayOffset(now) * dayWidth + dayWidth / 2}px` }}
                      />
                      {/* Bar */}
                      <div
                        className={`absolute top-2 h-7 rounded-lg ${statusColor(task.status)} opacity-90 hover:opacity-100 transition-opacity flex items-center px-2 shadow-md`}
                        style={{
                          left: `${startOffset * dayWidth + 2}px`,
                          width: `${duration * dayWidth - 4}px`,
                        }}
                        title={`${task.title}\n${start.toLocaleDateString('tr-TR')} - ${end.toLocaleDateString('tr-TR')}`}
                      >
                        <span className="text-[10px] text-white font-medium truncate">{task.title}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
