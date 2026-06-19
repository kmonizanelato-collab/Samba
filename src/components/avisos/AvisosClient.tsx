'use client';
import { useCallback, useEffect, useState } from 'react';
import { Session } from 'next-auth';
import { Megaphone, Plus, X, Pin, PinOff, Pencil, Trash2, User2, ShieldCheck } from 'lucide-react';
import { roomLabel, FUNDAMENTAL_ROOMS, MEDIO_ROOMS } from '@/lib/constants';

interface Announcement {
  id: number;
  title: string;
  content: string;
  grade: string | null;
  pinned: boolean;
  createdAt: string;
  createdBy?: { name: string; role: string };
}

interface Props {
  session: Session;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function AvisosClient({ session }: Props) {
  const canEdit = session.user.role === 'TEACHER' || session.user.role === 'ADMIN';
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [gradeFilter, setGradeFilter] = useState('ALL');

  const [form, setForm] = useState<{ mode: 'create' | 'edit'; item?: Announcement } | null>(null);
  const [fTitle, setFTitle] = useState('');
  const [fContent, setFContent] = useState('');
  const [fGrade, setFGrade] = useState('');
  const [fPinned, setFPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<Announcement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (canEdit && gradeFilter !== 'ALL') params.set('grade', gradeFilter);
    const res = await fetch(`/api/announcements?${params}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [gradeFilter, canEdit]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm({ mode: 'create' });
    setFTitle(''); setFContent(''); setFGrade(''); setFPinned(false); setFormError('');
  }
  function openEdit(a: Announcement) {
    setForm({ mode: 'edit', item: a });
    setFTitle(a.title); setFContent(a.content); setFGrade(a.grade ?? ''); setFPinned(a.pinned); setFormError('');
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const payload = { title: fTitle, content: fContent, grade: fGrade || null, pinned: fPinned };
    const res = await fetch('/api/announcements', {
      method: form?.mode === 'edit' ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form?.mode === 'edit' ? { ...payload, id: form.item!.id } : payload),
    });
    setSaving(false);
    if (res.ok) { setForm(null); load(); }
    else { const d = await res.json().catch(() => ({})); setFormError(d.error ?? 'Erro ao salvar.'); }
  }

  async function togglePin(a: Announcement) {
    await fetch('/api/announcements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: a.id, title: a.title, content: a.content, grade: a.grade, pinned: !a.pinned }),
    });
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    await fetch(`/api/announcements?id=${deleting.id}`, { method: 'DELETE' });
    setDeleting(null);
    load();
  }

  return (
    <main className="max-w-3xl mx-auto px-3 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
            <Megaphone size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 leading-tight">Mural de Avisos</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500">Recados e comunicados da escola</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {canEdit && (
            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="input-field w-auto text-sm py-2">
              <option value="ALL">Todas as salas</option>
              <option value="GLOBAL">Somente gerais</option>
              <optgroup label="Fundamental">{FUNDAMENTAL_ROOMS.map((r) => <option key={r} value={r}>{roomLabel(r)}</option>)}</optgroup>
              <optgroup label="Médio">{MEDIO_ROOMS.map((r) => <option key={r} value={r}>{roomLabel(r)}</option>)}</optgroup>
            </select>
          )}
          {canEdit && (
            <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Novo aviso</button>
          )}
        </div>
      </div>

      {/* Feed */}
      {items.length === 0 && !loading ? (
        <div className="card flex flex-col items-center justify-center text-center py-20 px-6">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center mb-4">
            <Megaphone size={30} className="text-pink-500 dark:text-pink-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Nenhum aviso por aqui</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {canEdit ? 'Crie o primeiro aviso para os alunos.' : 'Quando houver recados, eles aparecerão aqui.'}
          </p>
          {canEdit && <button onClick={openCreate} className="btn-primary mt-5">Novo aviso</button>}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((a) => {
            const RoleIcon = a.createdBy?.role === 'ADMIN' ? ShieldCheck : User2;
            return (
              <article key={a.id} className={`card p-5 transition-shadow hover:shadow-md ${a.pinned ? 'border-l-4 border-l-pink-500' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.pinned && <span className="badge bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300"><Pin size={11} /> Fixado</span>}
                      <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {a.grade ? roomLabel(a.grade) : 'Todas as salas'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-50 mt-2">{a.title}</h3>
                    <p className="text-[15px] text-gray-600 dark:text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">{a.content}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mt-3">
                      <RoleIcon size={13} />
                      <span>{a.createdBy?.name ?? 'Equipe'}</span>
                      <span>·</span>
                      <span>{formatWhen(a.createdAt)}</span>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => togglePin(a)} title={a.pinned ? 'Desafixar' : 'Fixar'} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500">
                        {a.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                      </button>
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"><Pencil size={15} /></button>
                      <button onClick={() => setDeleting(a)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {loading && <div className="text-center py-4 text-sm text-gray-400">Carregando...</div>}

      {/* Form modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <form onSubmit={save} className="card w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-50">{form.mode === 'edit' ? 'Editar aviso' : 'Novo aviso'}</h3>
              <button type="button" onClick={() => setForm(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"><X size={18} /></button>
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Título</label>
            <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} required autoFocus placeholder="Ex: Reunião de pais" className="input-field mb-4" />

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Mensagem</label>
            <textarea value={fContent} onChange={(e) => setFContent(e.target.value)} required rows={5} placeholder="Escreva o aviso..." className="input-field mb-4 resize-none" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Destinatário</label>
                <select value={fGrade} onChange={(e) => setFGrade(e.target.value)} className="input-field">
                  <option value="">Todas as salas</option>
                  <optgroup label="Fundamental">{FUNDAMENTAL_ROOMS.map((r) => <option key={r} value={r}>{roomLabel(r)}</option>)}</optgroup>
                  <optgroup label="Médio">{MEDIO_ROOMS.map((r) => <option key={r} value={r}>{roomLabel(r)}</option>)}</optgroup>
                </select>
              </div>
              <label className="flex items-center gap-2 self-end pb-2.5 cursor-pointer">
                <input type="checkbox" checked={fPinned} onChange={(e) => setFPinned(e.target.checked)} className="w-4 h-4 accent-pink-500" />
                <span className="text-sm text-gray-700 dark:text-slate-300 flex items-center gap-1"><Pin size={14} /> Fixar no topo</span>
              </label>
            </div>

            {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{formError}</div>}

            <div className="flex gap-2">
              <button type="button" onClick={() => setForm(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">{saving ? 'Publicando...' : (form.mode === 'edit' ? 'Salvar' : 'Publicar')}</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4"><Trash2 size={22} className="text-red-500" /></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-50">Excluir aviso?</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">“{deleting.title}” será removido permanentemente.</p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setDeleting(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
