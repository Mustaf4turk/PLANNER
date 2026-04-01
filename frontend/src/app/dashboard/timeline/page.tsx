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
        <h1 className="text-2xl font-bold text-white">Zaman Çizelgesi</h1>
        <div className="text-center py-16">
          <p className="text-slate-400">Tarih bilgisi olan görev bulunmuyor. Görevlere başlangıç ve bitiş tarihi ekleyin.</p>
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
    if (status === 'done') return 'bg-emerald-500';
    if (status === 'in-progress') return 'bg-amber-500';
    return 'bg-brand-500';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Zaman Çizelgesi</h1>

      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-x-auto">
        <div style={{ minWidth: `${totalDays * dayWidth + 250}px` }}>
          {/* Header */}
          <div className="flex border-b border-dark-border sticky top-0 bg-dark-card z-10">
            <div className="w-[250px] flex-shrink-0 px-4 py-3 border-r border-dark-border">
              <span className="text-sm font-medium text-slate-400">Görev</span>
            </div>
            <div className="flex">
              {dayHeaders.map((dh, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 text-center border-r border-dark-border py-2 ${
                    dh.isToday ? 'bg-brand-600/20' : ''
                  } ${dh.isFirstOfMonth ? 'border-l-2 border-l-slate-500' : ''}`}
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
              <div className="flex border-b border-dark-border bg-dark-bg/30">
                <div className="w-[250px] flex-shrink-0 px-4 py-2 border-r border-dark-border">
                  <span className="text-xs font-semibold text-brand-400 uppercase tracking-wide">{projectName}</span>
                </div>
                <div style={{ width: `${totalDays * dayWidth}px` }} />
              </div>

              {projectTasks.map(task => {
                const start = task.startDate ? new Date(task.startDate) : task.dueDate ? new Date(task.dueDate) : now;
                const end = task.dueDate ? new Date(task.dueDate) : task.startDate ? new Date(task.startDate) : now;
                const startOffset = getDayOffset(start);
                const duration = Math.max(1, getDayOffset(end) - startOffset + 1);

                return (
                  <div key={task.id} className="flex border-b border-dark-border hover:bg-dark-hover/20 transition-colors">
                    <div className="w-[250px] flex-shrink-0 px-4 py-3 border-r border-dark-border flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor(task.status)}`} />
                      <span className="text-sm text-white truncate">{task.title}</span>
                    </div>
                    <div className="relative" style={{ width: `${totalDays * dayWidth}px`, height: '44px' }}>
                      {/* Today line */}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-brand-500/30 z-0"
                        style={{ left: `${getDayOffset(now) * dayWidth + dayWidth / 2}px` }}
                      />
                      {/* Bar */}
                      <div
                        className={`absolute top-2 h-7 rounded-lg ${statusColor(task.status)} opacity-80 hover:opacity-100 transition-opacity flex items-center px-2`}
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
