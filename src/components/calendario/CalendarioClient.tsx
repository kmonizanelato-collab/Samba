'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Session } from 'next-auth';
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Pencil,
  Trash2,
  Clock,
} from 'lucide-react';
import {
  EVENT_TYPES,
  eventType,
  roomLabel,
  FUNDAMENTAL_ROOMS,
  MEDIO_ROOMS,
} from '@/lib/constants';
import { formatDate, DAY_NAMES } from '@/lib/utils';

interface EventItem {
  id: number;
  title: string;
  description: string | null;
  date: string;
  type: string;
  grade: string | null;
  createdBy?: { name: string };
}

interface Props {
  session: Session;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildMatrix(view: Date): Date[] {
  const first = startOfMonth(view);
  const gridStart = new Date(first);
  gridStart.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

function fullDateBR(d: Date) {
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

export function CalendarioClient({ session }: Props) {
  const canEdit = session.user.role === 'TEACHER' || session.user.role === 'ADMIN';
  const [view, setView] = useState<Date>(startOfMonth(new Date()));
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [gradeFilter, setGradeFilter] = useState('ALL');

  const [dayModal, setDayModal] = useState<Date | null>(null);
  const [form, setForm] = useState<{ mode: 'create' | 'edit'; event?: EventItem; date: string } | null>(null);
  const [fTitle, setFTitle] = useState('');
  const [fType, setFType] = useState('EVENTO');
  const [fDate, setFDate] = useState('');
  const [fGrade, setFGrade] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const matrix = useMemo(() => buildMatrix(view), [view]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const gridStart = matrix[0];
    const gridEnd = matrix[41];
    const params = new URLSearchParams({ start: formatDate(gridStart), end: formatDate(gridEnd) });
    if (canEdit && gradeFilter !== 'ALL') params.set('grade', gradeFilter);
    const res = await fetch(`/api/events?${params}`);
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [matrix, gradeFilter, canEdit]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const eventsByDay = useMemo(() => {
    const m: Record<string, EventItem[]> = {};
    for (const e of events) {
      const key = e.date.slice(0, 10);
      (m[key] ??= []).push(e);
    }
    return m;
  }, [events]);

  const todayKey = formatDate(new Date());

  const upcoming = useMemo(() => {
    return [...events]
      .filter((e) => e.date.slice(0, 10) >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events, todayKey]);

  function openCreate(dateStr: string) {
    setForm({ mode: 'create', date: dateStr });
    setFTitle(''); setFType('EVENTO'); setFDate(dateStr); setFGrade(''); setFDesc('');
    setFormError('');
  }

  function openEdit(e: EventItem) {
    setForm({ mode: 'edit', event: e, date: e.date.slice(0, 10) });
    setFTitle(e.title); setFType(e.type); setFDate(e.date.slice(0, 10));
    setFGrade(e.grade ?? ''); setFDesc(e.description ?? '');
    setFormError('');
  }

  async function saveEvent(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError('');
    setSaving(true);
    const payload = { title: fTitle, type: fType, date: fDate, grade: fGrade || null, description: fDesc };
    const res = await fetch('/api/events', {
      method: form?.mode === 'edit' ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form?.mode === 'edit' ? { ...payload, id: form.event!.id } : payload),
    });
    setSaving(false);
    if (res.ok) {
      setForm(null);
      setDayModal(null);
      loadEvents();
    } else {
      const d = await res.json().catch(() => ({}));
      setFormError(d.error ?? 'Erro ao salvar.');
    }
  }

  async function deleteEvent(id: number) {
    await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
    setForm(null);
    setDayModal(null);
    loadEvents();
  }

  const dayEvents = dayModal ? (eventsByDay[formatDate(dayModal)] ?? []) : [];

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <CalendarRange size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 leading-tight">Calendário</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500">Provas, trabalhos e eventos da escola</p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {canEdit && (
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="input-field w-auto text-sm py-2"
            >
              <option value="ALL">Todas as salas</option>
              <option value="GLOBAL">Somente gerais</option>
              <optgroup label="Fundamental">
                {FUNDAMENTAL_ROOMS.map((r) => <option key={r} value={r}>{roomLabel(r)}</option>)}
              </optgroup>
              <optgroup label="Médio">
                {MEDIO_ROOMS.map((r) => <option key={r} value={r}>{roomLabel(r)}</option>)}
              </optgroup>
            </select>
          )}
          {canEdit && (
            <button onClick={() => openCreate(todayKey)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} /> Novo evento
            </button>
          )}
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">
          {MONTHS[view.getMonth()]} <span className="text-gray-400 dark:text-slate-500 font-medium">{view.getFullYear()}</span>
        </h3>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="btn-secondary p-2"><ChevronLeft size={18} /></button>
          <button onClick={() => setView(startOfMonth(new Date()))} className="btn-secondary text-xs py-2 px-3">Hoje</button>
          <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="btn-secondary p-2"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        {/* Calendar */}
        <div className="card overflow-hidden">
          {/* weekday header */}
          <div className="grid grid-cols-7 border-b border-gray-100 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/50">
            {DAY_NAMES.map((d, i) => (
              <div key={d} className={`py-2.5 text-center text-xs font-semibold uppercase tracking-wide ${i === 0 || i === 6 ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}>
                {d}
              </div>
            ))}
          </div>
          {/* days grid */}
          <div className="grid grid-cols-7">
            {matrix.map((d, i) => {
              const key = formatDate(d);
              const inMonth = d.getMonth() === view.getMonth();
              const isToday = key === todayKey;
              const evs = eventsByDay[key] ?? [];
              const isWknd = d.getDay() === 0 || d.getDay() === 6;
              return (
                <button
                  key={i}
                  onClick={() => setDayModal(d)}
                  className={`group relative text-left min-h-[92px] p-1.5 border-b border-r border-gray-50 dark:border-slate-800/60 transition-colors
                    ${inMonth ? '' : 'bg-gray-50/40 dark:bg-slate-800/20'}
                    ${isWknd && inMonth ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}
                    hover:bg-blue-50/50 dark:hover:bg-blue-900/15`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold
                      ${isToday ? 'bg-blue-600 text-white shadow' : inMonth ? 'text-gray-700 dark:text-slate-300' : 'text-gray-300 dark:text-slate-600'}`}>
                      {d.getDate()}
                    </span>
                    {canEdit && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={13} className="text-blue-400" />
                      </span>
                    )}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {evs.slice(0, 3).map((e) => {
                      const t = eventType(e.type);
                      return (
                        <div key={e.id} className="flex items-center gap-1 rounded-md px-1 py-0.5 text-[10.5px] font-medium truncate"
                          style={{ backgroundColor: `${t.color}1a`, color: t.color }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                          <span className="truncate">{e.title}</span>
                        </div>
                      );
                    })}
                    {evs.length > 3 && (
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 pl-1">+{evs.length - 3} mais</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming + legend */}
        <div className="space-y-4">
          <div className="card p-4">
            <h4 className="text-sm font-bold text-gray-800 dark:text-slate-100 flex items-center gap-1.5 mb-3">
              <Clock size={15} className="text-blue-500" /> Próximos
            </h4>
            {upcoming.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-500">Nenhum evento próximo.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((e) => {
                  const t = eventType(e.type);
                  const d = new Date(e.date.slice(0, 10) + 'T00:00:00');
                  return (
                    <button key={e.id} onClick={() => setDayModal(d)} className="w-full flex items-start gap-2.5 text-left group">
                      <div className="flex flex-col items-center justify-center w-10 shrink-0 rounded-lg py-1" style={{ backgroundColor: `${t.color}1a` }}>
                        <span className="text-[10px] font-semibold uppercase" style={{ color: t.color }}>{MONTHS[d.getMonth()].slice(0, 3)}</span>
                        <span className="text-sm font-bold" style={{ color: t.color }}>{d.getDate()}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">{e.title}</div>
                        <div className="text-[11px] text-gray-400 dark:text-slate-500">
                          {t.emoji} {t.label}{e.grade ? ` · ${roomLabel(e.grade)}` : ' · Todas'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-4">
            <h4 className="text-sm font-bold text-gray-800 dark:text-slate-100 mb-3">Legenda</h4>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map((t) => (
                <span key={t.value} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-4 text-sm text-gray-400">Carregando...</div>}

      {/* Day modal */}
      {dayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setDayModal(null)}>
          <div className="card w-full max-w-md p-6 shadow-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-50 capitalize">{fullDateBR(dayModal)}</h3>
              <button onClick={() => setDayModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"><X size={18} /></button>
            </div>

            <div className="overflow-y-auto scrollbar-thin space-y-2 -mx-1 px-1">
              {dayEvents.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-slate-500 py-6 text-center">Nenhum evento neste dia.</p>
              ) : (
                dayEvents.map((e) => {
                  const t = eventType(e.type);
                  return (
                    <div key={e.id} className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                      <div className="flex">
                        <div className="w-1.5 shrink-0" style={{ backgroundColor: t.color }} />
                        <div className="flex-1 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="badge text-[10px] mb-1" style={{ backgroundColor: `${t.color}1a`, color: t.color }}>{t.emoji} {t.label}</span>
                              <div className="font-semibold text-gray-800 dark:text-slate-100">{e.title}</div>
                            </div>
                            {canEdit && (
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"><Pencil size={14} /></button>
                                <button onClick={() => deleteEvent(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={14} /></button>
                              </div>
                            )}
                          </div>
                          {e.description && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 whitespace-pre-wrap">{e.description}</p>}
                          <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-1.5">
                            {e.grade ? roomLabel(e.grade) : 'Todas as salas'}{e.createdBy ? ` · ${e.createdBy.name}` : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {canEdit && (
              <button onClick={() => openCreate(formatDate(dayModal))} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                <Plus size={16} /> Adicionar evento neste dia
              </button>
            )}
          </div>
        </div>
      )}

      {/* Event form modal */}
      {form && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <form onSubmit={saveEvent} className="card w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-50">{form.mode === 'edit' ? 'Editar evento' : 'Novo evento'}</h3>
              <button type="button" onClick={() => setForm(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"><X size={18} /></button>
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Título</label>
            <input value={fTitle} onChange={(e) => setFTitle(e.target.value)} required autoFocus placeholder="Ex: Prova de Matemática" className="input-field mb-4" />

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Tipo</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {EVENT_TYPES.map((t) => (
                <button type="button" key={t.value} onClick={() => setFType(t.value)}
                  className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium border transition-all ${fType === t.value ? 'text-white border-transparent' : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300'}`}
                  style={fType === t.value ? { backgroundColor: t.color } : {}}>
                  <span>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Data</label>
                <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Sala</label>
                <select value={fGrade} onChange={(e) => setFGrade(e.target.value)} className="input-field">
                  <option value="">Todas as salas</option>
                  <optgroup label="Fundamental">{FUNDAMENTAL_ROOMS.map((r) => <option key={r} value={r}>{roomLabel(r)}</option>)}</optgroup>
                  <optgroup label="Médio">{MEDIO_ROOMS.map((r) => <option key={r} value={r}>{roomLabel(r)}</option>)}</optgroup>
                </select>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Descrição <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} rows={3} placeholder="Conteúdo, observações..." className="input-field mb-4 resize-none" />

            {formError && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{formError}</div>}

            <div className="flex gap-2">
              {form.mode === 'edit' && (
                <button type="button" onClick={() => deleteEvent(form.event!.id)} className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30">Remover</button>
              )}
              <button type="button" onClick={() => setForm(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
