'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Users, Crown } from 'lucide-react';
import { AnimalAvatar } from './AnimalAvatar';

interface Member { id: number; name: string; gradeLabel: string | null; avatar: string | null; isOwner: boolean; }
interface Message { id: number; content: string; createdAt: string; authorId: number; author: string; avatar: string | null; }
interface GroupData { id: number; name: string; emoji: string; subject: string | null; members: Member[]; messages: Message[]; }

export function GrupoChatClient({ groupId, currentUserId }: { groupId: number; currentUserId: number }) {
  const [group, setGroup] = useState<GroupData | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/interactions/groups/${groupId}`);
    if (!res.ok) { setNotFound(true); return; }
    const d = await res.json();
    setGroup(d);
  }, [groupId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [group?.messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setSending(true);
    setText('');
    const res = await fetch(`/api/interactions/groups/${groupId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    setSending(false);
    if (res.ok) {
      const msg = await res.json();
      setGroup((g) => (g ? { ...g, messages: [...g.messages, msg] } : g));
    }
  }

  if (notFound) {
    return (
      <main className="jungle-scene min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="glass rounded-3xl p-8">
          <p className="text-gray-700 dark:text-slate-200 font-semibold">Você não participa deste grupo.</p>
          <Link href="/interactions/grupos" className="mt-4 inline-block btn-primary">Voltar aos grupos</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="jungle-scene min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative z-10 glass border-b border-white/40 dark:border-white/10 px-3 sm:px-5 py-3 flex items-center gap-3">
        <Link href="/interactions/grupos" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-slate-200"><ArrowLeft size={18} /></Link>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40 flex items-center justify-center text-xl shadow-inner shrink-0">{group?.emoji ?? '🌿'}</div>
        <div className="min-w-0 flex-1">
          <h1 className="font-extrabold text-gray-900 dark:text-slate-50 truncate leading-tight">{group?.name ?? 'Grupo'}</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{group?.subject ? `${group.subject} · ` : ''}{group?.members.length ?? 0} membros</p>
        </div>
        <button onClick={() => setShowMembers((s) => !s)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-slate-300">
          <Users size={18} />
        </button>
      </header>

      {/* Members dropdown */}
      {showMembers && group && (
        <div className="relative z-10 glass border-b border-white/40 dark:border-white/10 px-4 py-3">
          <div className="flex gap-3 overflow-x-auto scrollbar-thin max-w-3xl mx-auto">
            {group.members.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-1 shrink-0 w-16">
                <div className="relative">
                  <AnimalAvatar animal={m.avatar ?? 'monkey'} size={42} animated={false} />
                  {m.isOwner && <Crown size={13} className="absolute -top-1.5 -right-1 text-amber-400" />}
                </div>
                <span className="text-[10px] text-gray-600 dark:text-slate-300 truncate w-full text-center">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto scrollbar-thin px-3 sm:px-5 py-4 space-y-3">
        <div className="max-w-3xl mx-auto space-y-3">
          {group && group.messages.length === 0 && (
            <div className="text-center text-white/90 py-10">
              <div className="text-4xl mb-2">💬</div>
              Seja o primeiro a mandar uma mensagem!
            </div>
          )}
          {group?.messages.map((m) => {
            const mine = m.authorId === currentUserId;
            return (
              <div key={m.id} className={`flex items-end gap-2 j-fade-up ${mine ? 'flex-row-reverse' : ''}`}>
                <AnimalAvatar animal={m.avatar ?? 'monkey'} size={32} animated={false} />
                <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 shadow ${mine ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-bl-sm'}`}>
                  {!mine && <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mb-0.5">{m.author}</div>}
                  <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  <div className={`text-[10px] mt-0.5 ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                    {new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Composer */}
      <form onSubmit={send} className="relative z-10 glass border-t border-white/40 dark:border-white/10 p-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="flex-1 px-4 py-3 rounded-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button type="submit" disabled={sending || !text.trim()} className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 disabled:opacity-50 hover:scale-105 transition-transform active:scale-95">
            <Send size={18} />
          </button>
        </div>
      </form>
    </main>
  );
}
