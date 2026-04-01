'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Task } from '@/lib/types';

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    api.tasks.all()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday start
  const totalDays = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getTasksForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      return t.dueDate.startsWith(dateStr);
    });
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

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
        <h1 className="text-2xl font-bold text-white">Takvim</h1>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 bg-dark-card border border-dark-border rounded-xl text-slate-300 hover:bg-dark-hover transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={goToday} className="px-4 py-2 bg-dark-card border border-dark-border rounded-xl text-slate-300 hover:bg-dark-hover transition-colors text-sm font-medium">
            Bugün
          </button>
          <span className="text-lg font-semibold text-white min-w-[180px] text-center capitalize">{monthName}</span>
          <button onClick={nextMonth} className="p-2 bg-dark-card border border-dark-border rounded-xl text-slate-300 hover:bg-dark-hover transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
        {/* Week headers */}
        <div className="grid grid-cols-7 border-b border-dark-border">
          {weekDays.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dayTasks = day ? getTasksForDate(day) : [];
            return (
              <div
                key={idx}
                className={`min-h-[120px] border-r border-b border-dark-border p-2 ${
                  day === null ? 'bg-dark-bg/30' : 'hover:bg-dark-hover/20'
                } ${isToday(day!) ? 'bg-brand-600/10' : ''} transition-colors`}
              >
                {day !== null && (
                  <>
                    <div className={`text-sm mb-1 ${
                      isToday(day)
                        ? 'w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold'
                        : 'text-slate-400 pl-1'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={`text-[11px] px-2 py-1 rounded-md truncate ${
                            task.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                            task.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-brand-500/20 text-brand-300'
                          }`}
                          title={`${task.title} - ${task.project?.name}`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-[10px] text-slate-500 pl-2">+{dayTasks.length - 3} daha</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
