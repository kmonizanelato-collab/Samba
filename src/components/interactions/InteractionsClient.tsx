'use client';
import { useCallback, useEffect, useState } from 'react';
import { Session } from 'next-auth';
import { Trophy, Users, Sparkles, Check, X, UserPlus, Clock, Inbox, Wand2 } from 'lucide-react';
import { AvatarLook, DEFAULT_LOOK } from '@/lib/interactions';
import { AnimalAvatar } from './AnimalAvatar';
import { AvatarCustomizer } from './AvatarCustomizer';

interface Props {
  session: Session;
}

interface Look { avatar: string | null; hat?: string; accessory?: string; bg?: string; }
interface RankRow extends Look {
  id: number; name: string; gradeLabel: string | null;
  average: number | null; points: number; position: number;
  isMe: boolean; isFriend: boolean;
}
interface Classmate extends Look { id: number; name: string; status: 'friend' | 'sent' | 'received' | 'none'; }
interface PendingReq { id: number; user: Look & { id: number; name: string; gradeLabel: string | null }; }

const MEDALS = ['🥇', '🥈', '🥉'];

export function InteractionsClient({ session }: Props) {
  const [look, setLook] = useState<AvatarLook | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [tab, setTab] = useState<'ranking' | 'amigos'>('ranking');

  const [ranking, setRanking] = useState<RankRow[]>([]);
  const [me, setMe] = useState<RankRow | null>(null);
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [received, setReceived] = useState<PendingReq[]>([]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<AvatarLook>({ ...DEFAULT_LOOK });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/interactions/profile')
      .then((r) => r.json())
      .then((d) => setLook(d.look ?? null))
      .finally(() => setLoadingProfile(false));
  }, []);

  const loadHub = useCallback(async () => {
    const [rk, cm, fr] = await Promise.all([
      fetch('/api/interactions/ranking').then((r) => r.json()),
      fetch('/api/interactions/classmates').then((r) => r.json()),
      fetch('/api/interactions/friend-requests').then((r) => r.json()),
    ]);
    setRanking(rk.ranking ?? []);
    setMe(rk.me ?? null);
    setClassmates(Array.isArray(cm) ? cm : []);
    setReceived(fr.received ?? []);
  }, []);

  useEffect(() => { if (look) loadHub(); }, [look, loadHub]);

  async function saveLook(l: AvatarLook) {
    setSaving(true);
    const res = await fetch('/api/interactions/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(l),
    });
    setSaving(false);
    if (res.ok) {
      const d = await res.json();
      setLook(d.look);
      setEditorOpen(false);
    }
  }

  async function addFriend(id: number) {
    const res = await fetch('/api/interactions/friend-requests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toUserId: id }),
    });
    if (res.ok) loadHub();
  }
  async function respond(reqId: number, action: 'accept' | 'decline') {
    await fetch(`/api/interactions/friend-requests/${reqId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }),
    });
    loadHub();
  }

  // ---- Onboarding (sem perfil ainda) ----
  if (!loadingProfile && !look) {
    return (
      <main className="max-w-md mx-auto px-4 py-8">
        <Header />
        <div className="card p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50 text-center">Monte o seu personagem</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 mb-5 text-center">Escolha o animal e personalize com chapéu, óculos e cor.</p>
          <AvatarCustomizer look={draft} onChange={setDraft} />
          <button onClick={() => saveLook(draft)} disabled={saving} className="btn-primary w-full mt-5 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Entrar na competição'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Header />

      {/* Cartão "você" */}
      <div className="card p-5 mt-6 flex items-center gap-4">
        {look && <AnimalAvatar animal={look.animal} hat={look.hat} accessory={look.accessory} bg={look.bg} size={66} />}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-lg text-gray-900 dark:text-slate-50 truncate">{session.user.name}</div>
          <div className="text-sm text-gray-500 dark:text-slate-400">{session.user.grade} · Ensino {session.user.level === 'FUNDAMENTAL' ? 'Fundamental' : 'Médio'}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-amber-500 flex items-center gap-1 justify-end"><Sparkles size={18} /> {me?.points ?? 0}</div>
          <div className="text-[11px] text-gray-400 dark:text-slate-500">pontos{me ? ` · ${me.position}º` : ''}</div>
        </div>
        <button onClick={() => { if (look) setDraft(look); setEditorOpen(true); }} className="btn-secondary text-xs py-2 px-3 shrink-0 flex items-center gap-1">
          <Wand2 size={14} /> Personalizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mt-6 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
        <button onClick={() => setTab('ranking')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'ranking' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}>
          <Trophy size={16} /> Ranking
        </button>
        <button onClick={() => setTab('amigos')} className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'amigos' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}>
          <Users size={16} /> Amigos
          {received.length > 0 && <span className="absolute top-1 right-4 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{received.length}</span>}
        </button>
      </div>

      {/* Ranking */}
      {tab === 'ranking' && (
        <div className="card mt-4 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">Sua turma e amigos</span>
            <span className="text-[11px] text-gray-400 dark:text-slate-500">pontos = soma das notas</span>
          </div>
          {ranking.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400 dark:text-slate-500">Ainda não há pontuação. Quando houver notas no boletim, o ranking aparece aqui.</div>
          ) : (
            ranking.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-slate-800/50 last:border-0 ${p.isMe ? 'bg-blue-50/60 dark:bg-blue-900/15' : ''}`}>
                <span className="w-7 text-center font-extrabold text-gray-400 dark:text-slate-500">{i < 3 ? MEDALS[i] : `${p.position}º`}</span>
                <AnimalAvatar animal={p.avatar ?? 'monkey'} hat={p.hat} accessory={p.accessory} bg={p.bg} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-gray-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                    {p.name}
                    {p.isMe && <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[10px]">você</span>}
                    {!p.isMe && p.isFriend && <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px]">amigo</span>}
                  </div>
                  <div className="text-[11px] text-gray-400 dark:text-slate-500">{p.gradeLabel ?? '—'}{p.average !== null ? ` · média ${p.average.toFixed(1)}` : ''}</div>
                </div>
                <span className="flex items-center gap-1 text-sm font-extrabold text-amber-500"><Sparkles size={13} /> {p.points}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Amigos */}
      {tab === 'amigos' && (
        <div className="mt-4 space-y-4">
          {received.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-200"><Inbox size={15} /> Pedidos recebidos</div>
              {received.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-slate-800/50 last:border-0">
                  <AnimalAvatar animal={r.user.avatar ?? 'monkey'} hat={r.user.hat} accessory={r.user.accessory} bg={r.user.bg} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-800 dark:text-slate-100 truncate">{r.user.name}</div>
                    <div className="text-[11px] text-gray-400 dark:text-slate-500">{r.user.gradeLabel}</div>
                  </div>
                  <button onClick={() => respond(r.id, 'accept')} title="Aceitar" className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"><Check size={15} /></button>
                  <button onClick={() => respond(r.id, 'decline')} title="Recusar" className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/30 text-red-500"><X size={15} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 text-sm font-semibold text-gray-700 dark:text-slate-200">Colegas da sua sala ({session.user.grade})</div>
            {classmates.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400 dark:text-slate-500">Nenhum outro aluno cadastrado na sua sala ainda.</div>
            ) : (
              classmates.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-slate-800/50 last:border-0">
                  <AnimalAvatar animal={c.avatar ?? 'monkey'} hat={c.hat} accessory={c.accessory} bg={c.bg} size={40} />
                  <div className="min-w-0 flex-1 text-sm font-bold text-gray-800 dark:text-slate-100 truncate">{c.name}</div>
                  {c.status === 'friend' && <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"><Check size={11} /> Amigo</span>}
                  {c.status === 'sent' && <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"><Clock size={11} /> Enviado</span>}
                  {c.status === 'received' && <span className="badge bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"><Inbox size={11} /> Te chamou</span>}
                  {c.status === 'none' && (
                    <button onClick={() => addFriend(c.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2.5 py-1.5 rounded-lg"><UserPlus size={14} /> Adicionar</button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal personalizar */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-50 flex items-center gap-2"><Wand2 size={18} className="text-blue-500" /> Personalizar</h3>
              <button onClick={() => setEditorOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"><X size={18} /></button>
            </div>
            <AvatarCustomizer look={draft} onChange={setDraft} />
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditorOpen(false)} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={() => saveLook(draft)} disabled={saving} className="flex-1 btn-primary disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
        <Trophy size={22} className="text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-50 leading-tight">Samba Interactions</h1>
        <p className="text-xs text-gray-400 dark:text-slate-500">Personalize seu personagem e compita com a turma</p>
      </div>
    </div>
  );
}
