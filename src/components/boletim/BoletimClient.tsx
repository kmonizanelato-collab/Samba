'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Session } from 'next-auth';
import { ClipboardList, Edit3, Check, X, Users, UserCog, Sparkles } from 'lucide-react';
import { getSubjects, roomLabel } from '@/lib/constants';
import { calcFrequencia, calcFreqBimestre, getCFColor, getFreqColor, getGradeColor } from '@/lib/utils';
import { getAttendanceMessage } from '@/lib/ai/attendance';
import { StudentSelector, StudentOption } from '@/components/StudentSelector';

interface Grade {
  id: number;
  subject: string;
  bimester: number;
  nota: number | null;
  faltas: number;
  ac: number;
  aulasMinistradas: number;
}

interface Attendance {
  id: number;
  bimester: number;
  diasFaltados: number;
  diasPrevistos: number;
}

interface Props {
  session: Session;
}

function EditableCell({
  value,
  onSave,
  step = '0.1',
  min = '0',
  max = '10',
  disabled = false,
}: {
  value: number | null | undefined;
  onSave: (v: number | null) => void;
  step?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value !== null && value !== undefined ? String(value) : '');

  if (!editing) {
    return (
      <span
        className={`inline-block min-w-[1.5rem] ${disabled ? 'cursor-default' : 'cursor-pointer hover:underline hover:decoration-dotted'}`}
        onClick={() => !disabled && setEditing(true)}
      >
        {value !== null && value !== undefined ? value : '—'}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <input
        autoFocus
        type="number"
        className="w-14 text-center text-xs rounded border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-700 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={draft}
        step={step}
        min={min}
        max={max}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { onSave(draft !== '' ? parseFloat(draft) : null); setEditing(false); }
          if (e.key === 'Escape') setEditing(false);
        }}
      />
      <button onClick={() => { onSave(draft !== '' ? parseFloat(draft) : null); setEditing(false); }}>
        <Check size={12} className="text-green-600" />
      </button>
      <button onClick={() => setEditing(false)}>
        <X size={12} className="text-red-500" />
      </button>
    </span>
  );
}

export function BoletimClient({ session }: Props) {
  const isTeacherOrAdmin = session.user.role !== 'STUDENT';
  const canEdit = session.user.role === 'ADMIN' || session.user.role === 'TEACHER';

  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    isTeacherOrAdmin ? null : parseInt(session.user.id)
  );
  const [selectedLevel, setSelectedLevel] = useState<string>(session.user.level ?? 'MEDIO');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [studentInfo, setStudentInfo] = useState<{ name: string; grade: string; level: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(isTeacherOrAdmin);

  const selectedStudent = students.find((s) => s.id === selectedUserId) ?? null;

  useEffect(() => {
    if (isTeacherOrAdmin) {
      fetch('/api/users')
        .then((r) => r.json())
        .then((data: StudentOption[]) => setStudents(data));
    }
  }, [isTeacherOrAdmin]);

  const loadData = useCallback(async () => {
    if (!selectedUserId) {
      setGrades([]);
      setAttendance([]);
      setStudentInfo(null);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/boletim?userId=${selectedUserId}`);
    const data = await res.json();
    setGrades(data.grades ?? []);
    setAttendance(data.attendance ?? []);
    setStudentInfo(data.user ?? null);
    setLoading(false);
  }, [selectedUserId]);

  useEffect(() => { loadData(); }, [loadData]);

  const subjects = getSubjects(isTeacherOrAdmin ? selectedLevel : session.user.level);

  function getGrade(subject: string, bimester: number): Grade | undefined {
    return grades.find((g) => g.subject === subject && g.bimester === bimester);
  }

  async function updateGrade(subject: string, bimester: number, field: string, value: number | null) {
    if (!canEdit) return;
    await fetch('/api/boletim', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUserId, subject, bimester, [field]: value }),
    });
    loadData();
  }

  async function updateAttendance(bimester: number, field: 'diasFaltados' | 'diasPrevistos', value: number) {
    if (!canEdit) return;
    await fetch('/api/boletim', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUserId, bimester, [field]: value }),
    });
    loadData();
  }

  function getAttendance(bimester: number): Attendance | undefined {
    return attendance.find((a) => a.bimester === bimester);
  }

  const diasFaltadosTotal = [1, 2, 3, 4].reduce((sum, b) => sum + (getAttendance(b)?.diasFaltados ?? 0), 0);
  const diasPrevistosTotal = [1, 2, 3, 4].reduce((sum, b) => sum + (getAttendance(b)?.diasPrevistos ?? 50), 0);
  const freqAnual = calcFreqBimestre(diasFaltadosTotal, diasPrevistosTotal);
  const needsStudent = isTeacherOrAdmin && !selectedUserId;

  return (
    <main className="max-w-full px-2 sm:px-4 lg:px-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <ClipboardList size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 leading-tight">Boletim Escolar</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500">Notas, frequência e desempenho</p>
          </div>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={() => setSelectorOpen(true)}
            className="ml-auto flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-sm transition-all"
          >
            {selectedStudent ? (
              <>
                <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
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
      </div>

      {needsStudent ? (
        <EmptyState onSelect={() => setSelectorOpen(true)} />
      ) : (
        <>
          {/* Student info bar */}
          {studentInfo && (
            <div className="card px-5 py-3 mb-5 flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-slate-400">Aluno: </span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">{studentInfo.name}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400">Turma: </span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">{roomLabel(studentInfo.grade)}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400">Ensino: </span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">
                  {studentInfo.level === 'FUNDAMENTAL' ? 'Fundamental' : 'Médio'}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-gray-500 dark:text-slate-400">Freq. Anual: </span>
                <span className="flex items-center gap-1">
                  <span className={`font-bold text-base ${getFreqColor(freqAnual)}`}>{freqAnual}%</span>
                  <span className="text-xs text-gray-400">({diasFaltadosTotal} dias faltados)</span>
                </span>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex gap-2 mb-4 text-xs flex-wrap">
            <span className="badge bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"><span className="w-2 h-2 rounded-full bg-green-500" /> Freq. ≥ 90%</span>
            <span className="badge bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Freq. 75–90%</span>
            <span className="badge bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"><span className="w-2 h-2 rounded-full bg-red-500" /> Freq. &lt; 75% – Reprovado</span>
            <span className="badge bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500" /> Nota ≥ 5</span>
            <span className="badge bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"><span className="w-2 h-2 rounded-full bg-red-500" /> Nota &lt; 5</span>
          </div>

          {/* Table */}
          <div className="card overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-purple-50/40 dark:from-slate-800/60 dark:to-purple-900/10">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-700 sticky left-0 bg-gray-50 dark:bg-slate-800 z-10 min-w-[180px]">
                    Disciplina
                  </th>
                  {[1, 2, 3, 4].map((b) => (
                    <th key={b} colSpan={4} className="px-2 py-3 font-semibold text-gray-700 dark:text-slate-300 border-b border-l border-gray-100 dark:border-slate-700 text-center">
                      {b}º Bimestre
                    </th>
                  ))}
                  <th className="px-4 py-3 font-bold text-gray-700 dark:text-slate-300 border-b border-l border-gray-200 dark:border-slate-600 text-center">
                    CF
                  </th>
                </tr>
                <tr className="bg-gray-50/70 dark:bg-slate-800/40 text-xs">
                  <th className="sticky left-0 bg-gray-50 dark:bg-slate-800 z-10 border-b border-gray-100 dark:border-slate-700" />
                  {[1, 2, 3, 4].flatMap((b) =>
                    ['N', 'F', 'AC', '%F'].map((col) => (
                      <th key={`${b}-${col}`} className={`px-2 py-2 font-medium text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700 text-center ${col === 'N' ? 'border-l border-gray-100 dark:border-slate-700' : ''}`}>
                        {col}
                      </th>
                    ))
                  )}
                  <th className="border-b border-l border-gray-200 dark:border-slate-600" />
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, idx) => {
                  const gradeData = [1, 2, 3, 4].map((b) => getGrade(subject, b));
                  const cf = gradeData.reduce((sum, g) => sum + (g?.nota ?? 0), 0);
                  const hasAnyCF = gradeData.some((g) => g?.nota !== null && g?.nota !== undefined);

                  return (
                    <tr
                      key={subject}
                      className={`border-b border-gray-50 dark:border-slate-800/50 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30 dark:bg-slate-800/20'}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-gray-100 dark:border-slate-700">
                        {subject}
                      </td>

                      {[1, 2, 3, 4].map((bimester) => {
                        const g = getGrade(subject, bimester);
                        const freq = calcFrequencia(g?.faltas ?? 0, g?.aulasMinistradas ?? 50);

                        return (
                          <React.Fragment key={bimester}>
                            <td className={`px-2 py-2.5 text-center font-bold border-l border-gray-100 dark:border-slate-700 ${getGradeColor(g?.nota)}`}>
                              <EditableCell
                                value={g?.nota}
                                onSave={(v) => updateGrade(subject, bimester, 'nota', v)}
                                disabled={!canEdit}
                              />
                            </td>
                            <td className="px-2 py-2.5 text-center text-gray-600 dark:text-slate-400">
                              <EditableCell
                                value={g?.faltas ?? 0}
                                onSave={(v) => updateGrade(subject, bimester, 'faltas', v)}
                                step="1"
                                min="0"
                                max="999"
                                disabled={!canEdit}
                              />
                            </td>
                            <td className="px-2 py-2.5 text-center text-gray-600 dark:text-slate-400">
                              <EditableCell
                                value={g?.ac ?? 0}
                                onSave={(v) => updateGrade(subject, bimester, 'ac', v)}
                                disabled={!canEdit}
                              />
                            </td>
                            <td className={`px-2 py-2.5 text-center text-xs font-medium ${g ? getFreqColor(freq) : 'text-gray-400'}`}>
                              {g ? `${freq}%` : '—'}
                            </td>
                          </React.Fragment>
                        );
                      })}

                      {/* CF */}
                      <td className={`px-4 py-2.5 text-center font-bold text-base border-l border-gray-200 dark:border-slate-600 ${hasAnyCF ? getCFColor(cf) : 'text-gray-400'}`}>
                        {hasAnyCF ? cf.toFixed(1) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Frequência por Bimestre (IA) */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Sparkles size={15} className="text-purple-500" /> Frequência por Bimestre
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((bimester) => {
                const att = getAttendance(bimester);
                const diasFaltados = att?.diasFaltados ?? 0;
                const diasPrevistos = att?.diasPrevistos ?? 50;
                const ai = getAttendanceMessage(diasFaltados, diasPrevistos);
                const borderColor =
                  ai.status === 'excelente' ? 'border-green-500' :
                  ai.status === 'ok' ? 'border-blue-500' :
                  ai.status === 'risco' ? 'border-yellow-500' : 'border-red-500';

                return (
                  <div key={bimester} className={`card p-4 border-l-4 ${borderColor}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">{bimester}º Bimestre</span>
                      <span className={`font-bold text-lg ${getFreqColor(ai.frequencia)}`}>{ai.frequencia}%</span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-slate-500 mb-3 flex items-center gap-1">
                      {canEdit ? (
                        <>
                          <EditableCell value={diasFaltados} onSave={(v) => updateAttendance(bimester, 'diasFaltados', v ?? 0)} step="1" min="0" max="999" />
                          <span>/</span>
                          <EditableCell value={diasPrevistos} onSave={(v) => updateAttendance(bimester, 'diasPrevistos', v ?? 50)} step="1" min="1" max="999" />
                          <span>dias faltados/previstos</span>
                        </>
                      ) : (
                        <span>{diasFaltados}/{diasPrevistos} dias faltados/previstos</span>
                      )}
                    </div>
                    <div className="rounded-xl bg-purple-50 dark:bg-purple-900/15 border border-purple-100 dark:border-purple-800/30 p-2.5 flex gap-2">
                      <Sparkles size={14} className="text-purple-500 shrink-0 mt-0.5" />
                      <p className="text-xs leading-snug text-purple-800 dark:text-purple-300">{ai.mensagem}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`card p-5 border-l-4 ${freqAnual >= 90 ? 'border-green-500' : freqAnual >= 75 ? 'border-yellow-500' : 'border-red-500'}`}>
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Frequência Anual</div>
              <div className={`text-3xl font-bold ${getFreqColor(freqAnual)}`}>{freqAnual}%</div>
              <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                {diasFaltadosTotal} dias faltados · {diasPrevistosTotal} dias previstos no ano
              </div>
              {freqAnual < 75 && (
                <div className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-2 py-1">
                  ⚠ Reprovado por frequência
                </div>
              )}
            </div>

            <div className="card p-5 border-l-4 border-blue-500">
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Aprovação por Nota</div>
              <div className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-1">
                CF ≥ 20 por disciplina
              </div>
              <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                (soma das 4 notas bimestrais)
              </div>
            </div>

            <div className="card p-5 border-l-4 border-purple-500">
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Ano Letivo</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">2026</div>
              <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">200 dias · 9 aulas/dia</div>
            </div>
          </div>

          {canEdit && (
            <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Edit3 size={14} />
              <span>Clique em qualquer valor para editar. Pressione Enter para confirmar ou Esc para cancelar.</span>
            </div>
          )}

          {loading && (
            <div className="text-center py-4 text-sm text-gray-400">Carregando...</div>
          )}
        </>
      )}

      {/* Student selector modal */}
      {selectorOpen && (
        <StudentSelector
          students={students}
          selectedId={selectedUserId}
          accent="purple"
          onClose={() => setSelectorOpen(false)}
          onSelect={(s) => {
            setSelectedUserId(s.id);
            setSelectedLevel(s.level);
          }}
        />
      )}
    </main>
  );
}

function EmptyState({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4">
        <Users size={30} className="text-purple-500 dark:text-purple-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Selecione uma sala e um aluno</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-xs">
        Para visualizar o boletim, primeiro escolha a sala e depois o aluno desejado.
      </p>
      <button onClick={onSelect} className="btn-primary mt-5">
        Selecionar aluno
      </button>
    </div>
  );
}
