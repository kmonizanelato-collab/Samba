'use client';
import { useCallback, useEffect, useState } from 'react';
import { Session } from 'next-auth';
import { ChevronLeft, ChevronRight, CalendarDays, Plus, X, Palette, Users, UserCog } from 'lucide-react';
import {
  getWeekdaySlots,
  WEEKEND_SLOTS,
  SUGGESTED_ACTIVITIES,
  ACTIVITY_COLORS,
  roomLabel,
  TimeSlot,
} from '@/lib/constants';
import { formatDate, formatDateBR, getMonday, DAY_NAMES } from '@/lib/utils';
import { StudentSelector, StudentOption } from '@/components/StudentSelector';

interface AgendaEntry {
  id: number;
  date: string;
  timeSlot: string;
  activity?: string | null;
  customText?: string | null;
  color?: string | null;
}

interface Props {
  session: Session;
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function slotHeight(start: string, end: string): number {
  return (timeToMin(end) - timeToMin(start)) * 1.4;
}

export function AgendaClient({ session }: Props) {
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()));
  const [entries, setEntries] = useState<AgendaEntry[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(session.user.level ?? null);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState<{
    date: string;
    timeSlot: string;
    entry?: AgendaEntry;
  } | null>(null);
  const [modalActivity, setModalActivity] = useState('');
  const [modalCustom, setModalCustom] = useState('');
  const [modalColor, setModalColor] = useState('#2563eb');
  const [isCustom, setIsCustom] = useState(false);
  const [saving, setSaving] = useState(false);

  const isReadOnly = session.user.role === 'TEACHER';
  const isTeacherOrAdmin = session.user.role !== 'STUDENT';
  const [selectorOpen, setSelectorOpen] = useState(isTeacherOrAdmin);

  const selectedStudent = students.find((s) => s.id === selectedUserId) ?? null;

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  useEffect(() => {
    if (isTeacherOrAdmin) {
      fetch('/api/users')
        .then((r) => r.json())
        .then((data: StudentOption[]) => setStudents(data));
    }
  }, [isTeacherOrAdmin]);

  const loadEntries = useCallback(async () => {
    if (isTeacherOrAdmin && !selectedUserId) {
      setEntries([]);
      return;
    }
    setLoading(true);
    const uid = isTeacherOrAdmin ? selectedUserId : null;
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    const params = new URLSearchParams({
      startDate: formatDate(weekStart),
      endDate: formatDate(end),
      ...(uid ? { userId: String(uid) } : {}),
    });
    const res = await fetch(`/api/agenda?${params}`);
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  }, [weekStart, selectedUserId, isTeacherOrAdmin]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  function getWeekDates(): Date[] {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }

  const weekDates = getWeekDates();

  function getSlotsForDate(date: Date): TimeSlot[] {
    const dow = date.getDay();
    if (dow === 0 || dow === 6) return WEEKEND_SLOTS;
    return getWeekdaySlots(isTeacherOrAdmin ? selectedLevel : session.user.level);
  }

  function getEntry(date: Date, slot: TimeSlot): AgendaEntry | undefined {
    const ds = formatDate(date);
    return entries.find((e) => e.date.startsWith(ds) && e.timeSlot === slot.start);
  }

  function openModal(date: Date, slot: TimeSlot) {
    if (isReadOnly) return;
    const entry = getEntry(date, slot);
    setModal({ date: formatDate(date), timeSlot: slot.start, entry });
    if (entry) {
      const isC = !SUGGESTED_ACTIVITIES.includes(entry.activity ?? '');
      setIsCustom(isC);
      setModalActivity(isC ? '' : (entry.activity ?? ''));
      setModalCustom(isC ? (entry.customText ?? entry.activity ?? '') : '');
      setModalColor(entry.color ?? '#2563eb');
    } else {
      setModalActivity('');
      setModalCustom('');
      setModalColor('#2563eb');
      setIsCustom(false);
    }
  }

  async function saveEntry() {
    if (!modal) return;
    const activity = isCustom ? 'Personalizado' : modalActivity;
    const customText = isCustom ? modalCustom : undefined;
    if (!activity && !customText) return;

    setSaving(true);
    await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: modal.date,
        timeSlot: modal.timeSlot,
        activity,
        customText,
        color: modalColor,
        userId: isTeacherOrAdmin ? selectedUserId : undefined,
      }),
    });
    setSaving(false);
    setModal(null);
    loadEntries();
  }

  async function deleteEntry() {
    if (!modal?.entry) return;
    setSaving(true);
    await fetch(`/api/agenda?id=${modal.entry.id}`, { method: 'DELETE' });
    setSaving(false);
    setModal(null);
    loadEntries();
  }

  const today = formatDate(new Date());
  const needsStudent = isTeacherOrAdmin && !selectedUserId;

  return (
    <main className="max-w-full px-2 sm:px-4 lg:px-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <CalendarDays size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 leading-tight">Agenda</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500">Planejamento semanal de estudos</p>
          </div>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={() => setSelectorOpen(true)}
            className="ml-auto flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
          >
            {selectedStudent ? (
              <>
                <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-left leading-tight">
                  <span className="block text-sm font-semibold text-gray-800 dark:text-slate-100">{selectedStudent.name}</span>
                  <span className="block text-[11px] text-gray-400 dark:text-slate-500">{roomLabel(selectedStudent.grade)}</span>
                </span>
              </>
            ) : (
              <>
                <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  <Users size={15} className="text-gray-400" />
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Selecionar aluno</span>
              </>
            )}
            <UserCog size={15} className="text-gray-300 dark:text-slate-500" />
          </button>
        )}

        <div className={`flex items-center gap-1 ${isTeacherOrAdmin ? '' : 'ml-auto'}`}>
          <button
            onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}
            className="btn-secondary p-2"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-slate-300 min-w-[150px] text-center">
            {formatDateBR(weekStart)} – {formatDateBR(weekEnd)}
          </span>
          <button
            onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}
            className="btn-secondary p-2"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setWeekStart(getMonday(new Date()))}
            className="btn-secondary text-xs py-2 px-3"
          >
            Hoje
          </button>
        </div>
      </div>

      {needsStudent ? (
        <EmptyState onSelect={() => setSelectorOpen(true)} />
      ) : (
        /* Calendar Grid */
        <div className="card overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-blue-50/40 dark:from-slate-800/60 dark:to-blue-900/10">
            <div className="p-3 text-xs text-gray-400 dark:text-slate-500 font-medium">Horário</div>
            {weekDates.map((d, i) => {
              const isToday = formatDate(d) === today;
              const dow = d.getDay();
              const isWknd = dow === 0 || dow === 6;
              return (
                <div key={i} className={`p-3 text-center border-l border-gray-100 dark:border-slate-700 ${isWknd ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <div className={`text-xs font-medium uppercase tracking-wide ${isWknd ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}>
                    {DAY_NAMES[i === 6 ? 0 : i + 1] || DAY_NAMES[0]}
                  </div>
                  <div className={`text-lg font-bold mt-0.5 w-8 h-8 flex items-center justify-center mx-auto rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-gray-800 dark:text-slate-200'}`}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Body - all slots for the week */}
          <div className="overflow-y-auto max-h-[70vh] scrollbar-thin">
            {(() => {
              const allSlots = weekDates.map(getSlotsForDate);
              const maxSlots = allSlots.reduce((a, b) => (a.length > b.length ? a : b), []);

              return maxSlots.map((slot, si) => (
                <div
                  key={si}
                  className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-50 dark:border-slate-800/50 last:border-0"
                  style={{ height: `${slotHeight(slot.start, slot.end)}px`, minHeight: '38px' }}
                >
                  {/* Time label */}
                  <div className="flex flex-col justify-center px-2 border-r border-gray-100 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/30">
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 leading-tight">
                      {slot.start}
                    </span>
                    {slot.label !== slot.start && (
                      <span className="text-[9px] text-gray-400 dark:text-slate-500 leading-tight truncate">
                        {slot.label}
                      </span>
                    )}
                  </div>

                  {/* Day cells */}
                  {weekDates.map((date, di) => {
                    const daySlots = getSlotsForDate(date);
                    const matchSlot = daySlots.find((s) => s.start === slot.start);
                    const entry = matchSlot ? getEntry(date, matchSlot) : undefined;
                    const dow = date.getDay();
                    const isWknd = dow === 0 || dow === 6;

                    const isSchoolBreak = matchSlot?.isBreak || matchSlot?.isLunch;

                    if (!matchSlot) {
                      return (
                        <div key={di} className="border-l border-gray-100 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-800/10" />
                      );
                    }

                    return (
                      <div
                        key={di}
                        onClick={() => matchSlot && openModal(date, matchSlot)}
                        className={`border-l border-gray-100 dark:border-slate-700 relative group overflow-hidden
                          ${isWknd ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}
                          ${isSchoolBreak ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''}
                          ${!isReadOnly && !isSchoolBreak ? 'cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors' : ''}
                        `}
                      >
                        {entry ? (
                          <div
                            className="absolute inset-1 rounded-lg flex items-center px-2 text-white text-xs font-medium shadow-sm overflow-hidden transition-transform group-hover:scale-[1.02]"
                            style={{ backgroundColor: entry.color ?? '#2563eb' }}
                          >
                            <span className="truncate">
                              {entry.customText || entry.activity}
                            </span>
                          </div>
                        ) : isSchoolBreak ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[9px] text-amber-600/60 dark:text-amber-400/40 font-medium">
                              {matchSlot.label}
                            </span>
                          </div>
                        ) : !isReadOnly ? (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={14} className="text-blue-400 dark:text-blue-500" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4 text-sm text-gray-400 dark:text-slate-500">
          Carregando...
        </div>
      )}

      {isReadOnly && !needsStudent && (
        <div className="mt-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
          <span>👁</span>
          <span>Modo visualização – professores não podem editar a agenda dos alunos.</span>
        </div>
      )}

      {/* Student selector modal */}
      {selectorOpen && (
        <StudentSelector
          students={students}
          selectedId={selectedUserId}
          accent="blue"
          onClose={() => setSelectorOpen(false)}
          onSelect={(s) => {
            setSelectedUserId(s.id);
            setSelectedLevel(s.level);
          }}
        />
      )}

      {/* Activity Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-50">
                {modal.entry ? 'Editar Atividade' : 'Nova Atividade'}
              </h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              {modal.date} às {modal.timeSlot}
            </p>

            {/* Toggle custom / suggestion */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setIsCustom(false)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${!isCustom ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'}`}
              >
                Sugestões
              </button>
              <button
                onClick={() => setIsCustom(true)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${isCustom ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'}`}
              >
                Personalizado
              </button>
            </div>

            {isCustom ? (
              <input
                type="text"
                className="input-field mb-4"
                placeholder="Descreva sua atividade..."
                value={modalCustom}
                onChange={(e) => setModalCustom(e.target.value)}
                autoFocus
              />
            ) : (
              <div className="max-h-48 overflow-y-auto scrollbar-thin rounded-xl border border-gray-200 dark:border-slate-600 mb-4">
                {SUGGESTED_ACTIVITIES.map((act) => (
                  <button
                    key={act}
                    onClick={() => setModalActivity(act)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-gray-50 dark:border-slate-700 last:border-0
                      ${modalActivity === act
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                      }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            )}

            {/* Color picker */}
            <div className="flex items-center gap-2 mb-5">
              <Palette size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-slate-400">Cor:</span>
              <div className="flex gap-2">
                {ACTIVITY_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setModalColor(c.value)}
                    className={`w-7 h-7 rounded-full transition-transform ${modalColor === c.value ? 'scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-slate-500' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {modal.entry && (
                <button
                  onClick={deleteEntry}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                  Remover
                </button>
              )}
              <button onClick={() => setModal(null)} className="flex-1 btn-secondary">
                Cancelar
              </button>
              <button
                onClick={saveEntry}
                disabled={saving || (!isCustom && !modalActivity) || (isCustom && !modalCustom)}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function EmptyState({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
        <Users size={30} className="text-blue-500 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Selecione uma sala e um aluno</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-xs">
        Para visualizar a agenda, primeiro escolha a sala e depois o aluno desejado.
      </p>
      <button onClick={onSelect} className="btn-primary mt-5">
        Selecionar aluno
      </button>
    </div>
  );
}
