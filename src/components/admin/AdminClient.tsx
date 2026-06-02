'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Session } from 'next-auth';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  X,
  GraduationCap,
  User2,
  Users,
  School,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react';
import { FUNDAMENTAL_ROOMS, MEDIO_ROOMS, roomLabel } from '@/lib/constants';

interface ManagedUser {
  id: number;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  grade: string | null;
  level: string | null;
  createdAt: string;
}

interface Props {
  session: Session;
}

const ROLE_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  STUDENT: { label: 'Aluno', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: <GraduationCap size={14} /> },
  TEACHER: { label: 'Professor', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: <User2 size={14} /> },
  ADMIN: { label: 'Admin', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', icon: <ShieldCheck size={14} /> },
};

export function AdminClient({ session }: Props) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'TEACHER' | 'ADMIN'>('ALL');

  // Add form
  const [showForm, setShowForm] = useState(false);
  const [fName, setFName] = useState('');
  const [fRole, setFRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  const [fGrade, setFGrade] = useState('6A');
  const [fPassword, setFPassword] = useState('aluno@2026');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [pwTouched, setPwTouched] = useState(false);

  const [deleting, setDeleting] = useState<ManagedUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Sugere senha padrão conforme o tipo (se o admin ainda não digitou nada)
  function onRoleChange(role: 'STUDENT' | 'TEACHER' | 'ADMIN') {
    setFRole(role);
    if (!pwTouched) {
      setFPassword(role === 'STUDENT' ? 'aluno@2026' : role === 'TEACHER' ? 'professor@2026' : 'admin@2026');
    }
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fName,
        role: fRole,
        grade: fRole === 'STUDENT' ? fGrade : undefined,
        password: fPassword,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setShowForm(false);
      setFName('');
      setPwTouched(false);
      setFPassword(fRole === 'STUDENT' ? 'aluno@2026' : fRole === 'TEACHER' ? 'professor@2026' : 'admin@2026');
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error ?? 'Erro ao criar a conta.');
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/users?id=${deleting.id}`, { method: 'DELETE' });
    if (res.ok) {
      setDeleting(null);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error ?? 'Erro ao excluir.');
      setDeleting(null);
    }
  }

  const filtered = useMemo(() => {
    return users
      .filter((u) => (roleFilter === 'ALL' ? true : u.role === roleFilter))
      .filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || (u.grade ?? '').toLowerCase().includes(query.toLowerCase()));
  }, [users, roleFilter, query]);

  const counts = useMemo(() => ({
    total: users.length,
    students: users.filter((u) => u.role === 'STUDENT').length,
    teachers: users.filter((u) => u.role === 'TEACHER').length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
  }), [users]);

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 leading-tight">Administração</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500">Gerenciar contas de alunos, professores e admins</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setFormError(''); }} className="ml-auto btn-primary flex items-center gap-2">
          <UserPlus size={17} /> Nova conta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card p-4 border-l-4 border-gray-400"><div className="text-xs text-gray-500 dark:text-slate-400">Total</div><div className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">{counts.total}</div></div>
        <div className="card p-4 border-l-4 border-blue-500"><div className="text-xs text-gray-500 dark:text-slate-400">Alunos</div><div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{counts.students}</div></div>
        <div className="card p-4 border-l-4 border-purple-500"><div className="text-xs text-gray-500 dark:text-slate-400">Professores</div><div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{counts.teachers}</div></div>
        <div className="card p-4 border-l-4 border-orange-500"><div className="text-xs text-gray-500 dark:text-slate-400">Admins</div><div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{counts.admins}</div></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome ou sala..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-xl">
          {(['ALL', 'STUDENT', 'TEACHER', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${roleFilter === r ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-slate-400'}`}
            >
              {r === 'ALL' ? 'Todos' : ROLE_META[r].label + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800/60 text-left">
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-slate-300">Nome</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-slate-300">Tipo</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-slate-300">Sala / Ensino</th>
              <th className="px-4 py-3 font-semibold text-gray-700 dark:text-slate-300 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const meta = ROLE_META[u.role];
              const isSelf = u.id === parseInt(session.user.id);
              return (
                <tr key={u.id} className="border-t border-gray-50 dark:border-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-slate-200">
                    {u.name}
                    {isSelf && <span className="ml-2 text-[10px] text-gray-400">(você)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${meta.cls}`}>{meta.icon}{meta.label}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                    {u.role === 'STUDENT' && u.grade
                      ? `${roomLabel(u.grade)} · ${u.level === 'FUNDAMENTAL' ? 'Fundamental' : 'Médio'}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleting(u)}
                      disabled={isSelf}
                      title={isSelf ? 'Você não pode excluir a própria conta' : 'Excluir conta'}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400 dark:text-slate-500 text-sm">Nenhuma conta encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <div className="text-center py-4 text-sm text-gray-400">Carregando...</div>}

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <form onSubmit={addUser} className="card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-50 flex items-center gap-2"><UserPlus size={18} className="text-orange-500" /> Nova conta</h3>
              <button type="button" onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"><X size={18} /></button>
            </div>

            {/* Tipo */}
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Tipo de conta</label>
            <div className="flex gap-1 mb-4 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-xl">
              {(['STUDENT', 'TEACHER', 'ADMIN'] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => onRoleChange(r)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${fRole === r ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-slate-400'}`}
                >
                  {ROLE_META[r].icon} {ROLE_META[r].label}
                </button>
              ))}
            </div>

            {/* Nome */}
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Nome</label>
            <input value={fName} onChange={(e) => setFName(e.target.value)} required autoFocus placeholder="Nome do usuário" className="input-field mb-4" />

            {/* Sala (apenas aluno) */}
            {fRole === 'STUDENT' && (
              <>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Sala / Série</label>
                <select value={fGrade} onChange={(e) => setFGrade(e.target.value)} className="input-field mb-4">
                  <optgroup label="Ensino Fundamental">
                    {FUNDAMENTAL_ROOMS.map((r) => <option key={r} value={r}>{roomLabel(r)}</option>)}
                  </optgroup>
                  <optgroup label="Ensino Médio">
                    {MEDIO_ROOMS.map((r) => <option key={r} value={r}>{roomLabel(r)}</option>)}
                  </optgroup>
                </select>
              </>
            )}

            {/* Senha */}
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Senha</label>
            <div className="relative mb-4">
              <input
                type={showPw ? 'text' : 'password'}
                value={fPassword}
                onChange={(e) => { setFPassword(e.target.value); setPwTouched(true); }}
                required
                className="input-field pr-12"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm">{formError}</div>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-60">{saving ? 'Criando...' : 'Criar conta'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-50">Excluir conta?</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              A conta de <span className="font-semibold text-gray-800 dark:text-slate-200">{deleting.name}</span>
              {deleting.grade ? ` (${roomLabel(deleting.grade)})` : ''} será removida permanentemente, junto com agenda, notas e metas. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setDeleting(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
