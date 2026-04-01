'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Teammate } from '@/lib/types';

export default function TeamPage() {
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.members.teammates()
      .then(setTeammates)
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

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-extrabold text-white">Ekip</h1>
        <p className="text-slate-400 text-sm mt-1">{teammates.length} ekip arkadaşı</p>
      </div>

      {teammates.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass mb-5">
            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-slate-400 text-lg font-medium">Henüz ekip arkadaşınız yok</p>
          <p className="text-slate-500 text-sm mt-1">Projelerinize üye davet edin!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {teammates.map((tm, i) => {
            const gradients = [
              'from-blue-500 to-cyan-400',
              'from-purple-500 to-pink-400',
              'from-emerald-500 to-teal-400',
              'from-amber-500 to-orange-400',
              'from-rose-500 to-pink-400',
              'from-indigo-500 to-blue-400',
            ];
            const grad = gradients[i % gradients.length];
            return (
              <div key={tm.id} className="glass rounded-2xl p-6 card-hover group relative overflow-hidden">
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${grad} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-xl text-white font-bold shadow-lg`}>
                      {tm.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{tm.name}</h3>
                      <p className="text-sm text-slate-400">{tm.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-3">Ortak Projeler</p>
                    {tm.projects.map(p => (
                      <div key={p.id} className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                        <span className="text-sm text-white font-medium">{p.name}</span>
                        <span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold ${
                          p.role === 'owner' ? 'bg-amber-500/15 text-amber-400' : 'bg-brand-500/15 text-brand-300'
                        }`}>
                          {p.role === 'owner' ? 'Sahip' : 'Üye'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
