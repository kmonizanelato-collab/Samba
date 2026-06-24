'use client';
import { useCallback, useEffect, useState } from 'react';
import { X, UserPlus, Inbox, Check, Ban, Clock } from 'lucide-react';
import { FUNDAMENTAL_ROOMS, MEDIO_ROOMS, roomLabel } from '@/lib/constants';
import { AnimalAvatar } from './AnimalAvatar';

interface FriendUser {
  id: number;
  name: string;
  grade: string | null;
  gradeLabel: string | null;
  avatar: string | null;
}

interface PendingRequest {
  id: number;
  createdAt: string;
  user: FriendUser;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function FriendsPanel({ open, onClose }: Props) {
  const [tab, setTab] = useState<'add' | 'inbox'>('add');
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [received, setReceived] = useState<PendingRequest[]>([]);
  const [sent, setSent] = useState<PendingRequest[]>([]);

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    const [f, r] = await Promise.all([
      fetch('/api/interactions/friends').then((res) => res.json()),
      fetch('/api/interactions/friend-requests').then((res) => res.json()),
    ]);
    setFriends(Array.isArray(f) ? f : []);
    setReceived(r.received ?? []);
    setSent(r.sent ?? []);
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage(null);
    const res = await fetch('/api/interactions/friend-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, grade }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (res.ok) {
      setMessage({ type: 'ok', text: 'Pedido de amizade enviado!' });
      setName('');
      setGrade('');
      load();
    } else {
      setMessage({ type: 'error', text: data.error ?? 'Não foi possível enviar o pedido.' });
    }
  }

  async function respond(id: number, action: 'accept' | 'decline') {
    await fetch(`/api/interactions/friend-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    load();
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-slate-900 z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-50">Amizades</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
            Meus amigos ({friends.length})
          </span>
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-thin">
            {friends.length === 0 && <span className="text-sm text-gray-400 dark:text-slate-500">Nenhum amigo ainda.</span>}
            {friends.map((f) => (
              <div key={f.id} className="flex flex-col items-center gap-1 shrink-0 w-16">
                <AnimalAvatar animal={f.avatar ?? 'monkey'} size={44} animated={false} />
                <span className="text-[10px] text-gray-600 dark:text-slate-300 truncate w-full text-center">{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex border-b border-gray-100 dark:border-slate-800">
          <button
            onClick={() => setTab('add')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors ${
              tab === 'add' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-400 dark:text-slate-500'
            }`}
          >
            <UserPlus size={15} /> Adicionar
          </button>
          <button
            onClick={() => setTab('inbox')}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors ${
              tab === 'inbox' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-400 dark:text-slate-500'
            }`}
          >
            <Inbox size={15} /> Caixa de entrada
            {received.length > 0 && (
              <span className="absolute top-1.5 right-6 w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {received.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          {tab === 'add' ? (
            <form onSubmit={sendRequest} className="flex flex-col gap-3">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Adicione qualquer aluno da escola pelo nome e pela sala.
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nome do aluno"
                className="input-field"
              />
              <select value={grade} onChange={(e) => setGrade(e.target.value)} required className="input-field">
                <option value="">Selecione a sala</option>
                <optgroup label="Fundamental">
                  {FUNDAMENTAL_ROOMS.map((r) => (
                    <option key={r} value={r}>{roomLabel(r)}</option>
                  ))}
                </optgroup>
                <optgroup label="Médio">
                  {MEDIO_ROOMS.map((r) => (
                    <option key={r} value={r}>{roomLabel(r)}</option>
                  ))}
                </optgroup>
              </select>
              {message && (
                <div className={`text-sm rounded-xl p-3 ${message.type === 'ok' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                  {message.text}
                </div>
              )}
              <button type="submit" disabled={sending} className="btn-primary disabled:opacity-60">
                {sending ? 'Enviando...' : 'Enviar pedido de amizade'}
              </button>

              {sent.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">
                    Pedidos enviados
                  </span>
                  <div className="flex flex-col gap-2 mt-2">
                    {sent.map((r) => (
                      <div key={r.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800">
                        <AnimalAvatar animal={r.user.avatar ?? 'monkey'} size={32} animated={false} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">{r.user.name}</div>
                          <div className="text-xs text-gray-400 dark:text-slate-500">{r.user.gradeLabel}</div>
                        </div>
                        <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
                          <Clock size={11} /> Aguardando
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="flex flex-col gap-2.5">
              {received.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-10">Nenhum pedido por aqui.</p>
              )}
              {received.map((r) => (
                <div key={r.id} className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
                  <AnimalAvatar animal={r.user.avatar ?? 'monkey'} size={40} animated={false} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">{r.user.name}</div>
                    <div className="text-xs text-gray-400 dark:text-slate-500">{r.user.gradeLabel}</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => respond(r.id, 'accept')}
                      title="Aceitar"
                      className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => respond(r.id, 'decline')}
                      title="Recusar"
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/30 text-red-500"
                    >
                      <Ban size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
