'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Waves, MessagesSquare, Users } from 'lucide-react';
import { AnimalAvatar } from './AnimalAvatar';
import { JungleBackground, InteractionsTopBar } from './JungleScene';
import { Outfit } from '@/lib/interactions';

interface Friend { id: number; name: string; avatar: string | null; outfit?: Outfit | null; }
interface GroupCard {
  id: number;
  name: string;
  emoji: string;
  subject: string | null;
  memberCount: number;
  messageCount: number;
  members: { id: number; name: string; avatar: string | null; outfit?: Outfit | null }[];
  lastMessage: { content: string; author: string } | null;
}

const EMOJIS = ['🌿', '📚', '🦁', '🐯', '🐵', '🐼', '🦒', '🦜', '🔢', '🧪', '🌎', '✏️'];

export function GruposClient() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupCard[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌿');
  const [subject, setSubject] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [g, f] = await Promise.all([
      fetch('/api/interactions/groups').then((r) => r.json()),
      fetch('/api/interactions/friends').then((r) => r.json()),
    ]);
    setGroups(Array.isArray(g) ? g : []);
    setFriends(Array.isArray(f) ? f : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const res = await fetch('/api/interactions/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, emoji, subject, memberIds: selected }),
    });
    setSaving(false);
    if (res.ok) {
      const d = await res.json();
      router.push(`/interactions/grupos/${d.id}`);
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Erro ao criar o grupo.');
    }
  }

  return (
    <main className="jungle-scene min-h-screen relative overflow-hidden pb-16">
      <JungleBackground />
      <InteractionsTopBar backHref="/interactions" backLabel="Selva">
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-teal-700 font-bold text-sm rounded-full px-4 py-2.5 shadow-lg transition-all hover:scale-105 active:scale-95">
          <Plus size={16} /> Novo grupo
        </button>
      </InteractionsTopBar>

      <div className="relative z-10 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-6 jungle-pop">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-br from-cyan-400 to-teal-500 shadow-xl shadow-teal-500/40 mb-2 j-float">
            <Waves size={26} className="text-white" />
          </div>
          <h1 className="text-white font-extrabold text-3xl drop-shadow-lg">Lagoa de Estudos</h1>
          <p className="text-white/90 text-sm">Grupos para estudar e conversar com os amigos</p>
        </div>

        {loading ? (
          <div className="text-center text-white/90 py-10">Carregando...</div>
        ) : groups.length === 0 ? (
          <div className="glass rounded-3xl p-8 text-center">
            <div className="text-5xl mb-2">🌊</div>
            <h3 className="font-extrabold text-gray-800 dark:text-slate-100">Nenhum grupo ainda</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Crie o primeiro grupo e chame seus amigos para estudar juntos.</p>
            <button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-teal-500/30 hover:scale-105 transition-transform active:scale-95">
              <Plus size={16} /> Criar grupo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((g, i) => (
              <button
                key={g.id}
                onClick={() => router.push(`/interactions/grupos/${g.id}`)}
                className="feature-card glass rounded-3xl p-4 text-left shadow-xl j-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40 flex items-center justify-center text-2xl shadow-inner">{g.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-gray-900 dark:text-slate-50 truncate">{g.name}</h3>
                    {g.subject && <span className="badge bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 text-[10px]">{g.subject}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex -space-x-2">
                    {g.members.slice(0, 4).map((m) => (
                      <div key={m.id} className="ring-2 ring-white dark:ring-slate-800 rounded-full">
                        <AnimalAvatar animal={m.avatar ?? 'monkey'} outfit={m.outfit ?? undefined} size={26} animated={false} />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1"><Users size={12} /> {g.memberCount}</span>
                  <span className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1 ml-auto"><MessagesSquare size={12} /> {g.messageCount}</span>
                </div>
                {g.lastMessage && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 truncate">
                    <span className="font-semibold">{g.lastMessage.author}:</span> {g.lastMessage.content}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal criar */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <form onSubmit={create} className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-slate-50">Novo grupo de estudo</h3>
              <button type="button" onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"><X size={18} /></button>
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Emoji</label>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {EMOJIS.map((e) => (
                <button type="button" key={e} onClick={() => setEmoji(e)} className={`text-xl py-1.5 rounded-xl transition-all ${emoji === e ? 'bg-teal-100 dark:bg-teal-900/40 ring-2 ring-teal-400 scale-110' : 'bg-gray-50 dark:bg-slate-800 hover:scale-105'}`}>{e}</button>
              ))}
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Nome do grupo</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus placeholder="Ex: Turma da Matemática" className="input-field mb-4" />

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Matéria <span className="text-gray-400 font-normal">(opcional)</span></label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Matemática" className="input-field mb-4" />

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Convidar amigos</label>
            {friends.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 mb-4">Você ainda não tem amigos. Adicione amigos para convidá-los.</p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 mb-4 max-h-44 overflow-y-auto scrollbar-thin">
                {friends.map((f) => {
                  const on = selected.includes(f.id);
                  return (
                    <button type="button" key={f.id} onClick={() => setSelected((s) => on ? s.filter((x) => x !== f.id) : [...s, f.id])}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${on ? 'border-teal-300 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                      <AnimalAvatar animal={f.avatar ?? 'monkey'} outfit={f.outfit ?? undefined} size={30} animated={false} />
                      <span className="text-sm font-medium text-gray-800 dark:text-slate-100 flex-1 text-left">{f.name}</span>
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${on ? 'bg-teal-500 border-teal-500' : 'border-gray-300 dark:border-slate-600'}`}>
                        {on && <span className="text-white text-[11px]">✓</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}

            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="flex-1 btn-secondary">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-bold py-2.5 rounded-xl shadow-lg disabled:opacity-60 hover:scale-[1.02] transition-transform active:scale-95">{saving ? 'Criando...' : 'Criar grupo'}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
