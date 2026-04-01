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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Ekip</h1>
        <p className="text-slate-400 text-sm mt-1">{teammates.length} ekip arkadaşı</p>
      </div>

      {teammates.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-card border border-dark-border mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-slate-400">Henüz ekip arkadaşınız yok. Projelerinize üye davet edin!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teammates.map(tm => (
            <div key={tm.id} className="bg-dark-card rounded-2xl border border-dark-border p-6 hover:border-dark-hover transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-lg text-white font-bold">
                  {tm.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{tm.name}</h3>
                  <p className="text-sm text-slate-400">{tm.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Ortak Projeler</p>
                {tm.projects.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-dark-bg/50">
                    <span className="text-sm text-white">{p.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.role === 'owner' ? 'bg-amber-500/20 text-amber-400' : 'bg-brand-500/20 text-brand-300'
                    }`}>
                      {p.role === 'owner' ? 'Sahip' : 'Üye'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
