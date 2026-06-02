'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Session } from 'next-auth';
import { Target, Check, X, Users, UserCog, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getSubjects, roomLabel } from '@/lib/constants';
import { getMetaColor } from '@/lib/utils';
import { StudentSelector, StudentOption } from '@/components/StudentSelector';

interface Grade { subject: string; bimester: number; nota: number | null; }
interface Goal { subject: string; bimester: number; metaNota: number | null; }

interface Props { session: Session; }

function MetaCell({
  meta,
  nota,
  canEdit,
  onSave,
}: {
  meta: number | null;
  nota: number | null;
  canEdit: boolean;
  onSave: (v: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(meta !== null ? String(meta) : '');

  const color = getMetaColor(meta, nota);
  const Icon = nota !== null && meta !== null
    ? nota >= meta ? TrendingUp : TrendingDown
    : Minus;

  if (!editing) {
    return (
      <div
        className={`flex flex-col items-center gap-0.5 ${canEdit ? 'cursor-pointer hover:opacity-80' : ''}`}
        onClick={() => canEdit && setEditing(true)}
      >
        <span className={`font-bold ${meta !== null ? color : 'text-gray-400'}`}>
          {meta !== null ? meta : '—'}
        </span>
        {nota !== null && meta !== null && (
          <Icon size={10} className={color} />
        )}
      </div>
    );
  }

  return (
    <span className="flex items-center gap-0.5 justify-center">
      <input
        autoFocus
        type="number"
        className="w-14 text-center text-xs rounded border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-700 py-0.5 focus:outline-none"
        value={draft}
        step="0.1"
        min="0"
        max="10"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { onSave(draft !== '' ? parseFloat(draft) : null); setEditing(false); }
          if (e.key === 'Escape') setEditing(false);
        }}
      />
      <button onClick={() => { onSave(draft !== '' ? parseFloat(draft) : null); setEditing(false); }}>
        <Check size={11} className="text-green-600" />
      </button>
      <button onClick={() => setEditing(false)}>
        <X size={11} className="text-red-500" />
      </button>
    </span>
  );
}

export function MetasClient({ session }: Props) {
  const isTeacherOrAdmin = session.user.role !== 'STUDENT';
  const canEdit = session.user.role !== 'TEACHER';

  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    isTeacherOrAdmin ? null : parseInt(session.user.id)
  );
  const [selectedLevel, setSelectedLevel] = useState<string>(session.user.level ?? 'MEDIO');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [studentInfo, setStudentInfo] = useState<{ name: string; grade: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(isTeacherOrAdmin);

  const selectedStudent = students.find((s) => s.id === selectedUserId) ?? null;
  const needsStudent = isTeacherOrAdmin && !selectedUserId;

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
      setGoals([]);
      setStudentInfo(null);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/metas?userId=${selectedUserId}`);
    const data = await res.json();
    setGrades(data.grades ?? []);
    setGoals(data.goals ?? []);
    setStudentInfo(data.user ?? null);
    setLoading(false);
  }, [selectedUserId]);

  useEffect(() => { loadData(); }, [loadData]);

  const subjects = getSubjects(isTeacherOrAdmin ? selectedLevel : session.user.level);

  function getMeta(subject: string, bimester: number): number | null {
    return goals.find((g) => g.subject === subject && g.bimester === bimester)?.metaNota ?? null;
  }

  function getNota(subject: string, bimester: number): number | null {
    return grades.find((g) => g.subject === subject && g.bimester === bimester)?.nota ?? null;
  }

  async function saveMeta(subject: string, bimester: number, metaNota: number | null) {
    if (!canEdit) return;
    await fetch('/api/metas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedUserId, subject, bimester, metaNota }),
    });
    loadData();
  }

  const totalMetas = subjects.flatMap((s) => [1, 2, 3, 4].map((b) => ({ meta: getMeta(s, b), nota: getNota(s, b) }))).filter((x) => x.meta !== null);
  const metasBatidas = totalMetas.filter((x) => x.nota !== null && x.nota >= (x.meta ?? 0)).length;

  return (
    <main className="max-w-full px-2 sm:px-4 lg:px-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Target size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 leading-tight">Boletim de Metas</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500">Objetivos de notas por bimestre</p>
          </div>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={() => setSelectorOpen(true)}
            className="ml-auto flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-2xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-sm transition-all"
          >
            {selectedStudent ? (
              <>
                <span className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
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

      {needsStudent && (
        <div className="card flex flex-col items-center justify-center text-center py-20 px-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
            <Users size={30} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Selecione uma sala e um aluno</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-xs">
            Para visualizar as metas, primeiro escolha a sala e depois o aluno desejado.
          </p>
          <button onClick={() => setSelectorOpen(true)} className="btn-primary mt-5">
            Selecionar aluno
          </button>
        </div>
      )}

      {!needsStudent && (
      <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 border-l-4 border-emerald-500">
          <div className="text-xs text-gray-500 dark:text-slate-400">Metas Definidas</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">{totalMetas.length}</div>
        </div>
        <div className="card p-4 border-l-4 border-green-500">
          <div className="text-xs text-gray-500 dark:text-slate-400">Metas Batidas</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{metasBatidas}</div>
        </div>
        <div className="card p-4 border-l-4 border-red-500">
          <div className="text-xs text-gray-500 dark:text-slate-400">Metas Pendentes</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {totalMetas.filter((x) => x.nota === null || x.nota < (x.meta ?? 0)).length}
          </div>
        </div>
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="text-xs text-gray-500 dark:text-slate-400">Taxa de Sucesso</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {totalMetas.length > 0 ? Math.round((metasBatidas / totalMetas.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs flex-wrap">
        <span className="flex items-center gap-1"><TrendingUp size={12} className="text-green-500" /> Meta atingida ou superada</span>
        <span className="flex items-center gap-1"><TrendingDown size={12} className="text-red-500" /> Meta não atingida</span>
        <span className="flex items-center gap-1 text-gray-400">— Meta não definida</span>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60">
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-700 sticky left-0 bg-gray-50 dark:bg-slate-800 z-10 min-w-[180px]">
                Disciplina
              </th>
              {[1, 2, 3, 4].map((b) => (
                <th key={b} colSpan={2} className="px-2 py-3 font-semibold text-gray-700 dark:text-slate-300 border-b border-l border-gray-100 dark:border-slate-700 text-center">
                  {b}º Bimestre
                </th>
              ))}
            </tr>
            <tr className="bg-gray-50/70 dark:bg-slate-800/40 text-xs">
              <th className="sticky left-0 bg-gray-50 dark:bg-slate-800 z-10 border-b border-gray-100 dark:border-slate-700" />
              {[1, 2, 3, 4].flatMap((b) => [
                <th key={`${b}-m`} className="px-3 py-2 font-medium text-emerald-600 dark:text-emerald-400 border-b border-l border-gray-100 dark:border-slate-700 text-center">
                  Meta
                </th>,
                <th key={`${b}-n`} className="px-3 py-2 font-medium text-blue-600 dark:text-blue-400 border-b border-gray-100 dark:border-slate-700 text-center">
                  Nota
                </th>
              ])}
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, idx) => (
              <tr
                key={subject}
                className={`border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30 dark:bg-slate-800/20'}`}
              >
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-gray-100 dark:border-slate-700">
                  {subject}
                </td>
                {[1, 2, 3, 4].map((bimester) => {
                  const meta = getMeta(subject, bimester);
                  const nota = getNota(subject, bimester);

                  return (
                    <React.Fragment key={bimester}>
                      <td className="px-3 py-3 text-center border-l border-gray-100 dark:border-slate-700">
                        <MetaCell
                          meta={meta}
                          nota={nota}
                          canEdit={canEdit}
                          onSave={(v) => saveMeta(subject, bimester, v)}
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`font-medium ${nota !== null ? (nota >= 5 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400') : 'text-gray-400'}`}>
                          {nota !== null ? nota : '—'}
                        </span>
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canEdit && session.user.role === 'STUDENT' && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Target size={14} />
          <span>Clique em qualquer meta para definir ou alterar seu objetivo. As notas são preenchidas pelo professor.</span>
        </div>
      )}

      {session.user.role === 'TEACHER' && (
        <div className="mt-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
          <span>👁</span>
          <span>Modo visualização – professores podem ver as metas dos alunos mas não podem alterá-las.</span>
        </div>
      )}

      {loading && <div className="text-center py-4 text-sm text-gray-400">Carregando...</div>}
      </>
      )}

      {/* Student selector modal */}
      {selectorOpen && (
        <StudentSelector
          students={students}
          selectedId={selectedUserId}
          accent="emerald"
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
