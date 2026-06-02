'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookOpen, GraduationCap, User2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GRADES_LIST } from '@/lib/constants';

type RoleTab = 'STUDENT' | 'TEACHER' | 'ADMIN';

const tabs: { role: RoleTab; label: string; icon: React.ReactNode; color: string }[] = [
  { role: 'STUDENT', label: 'Aluno', icon: <GraduationCap size={18} />, color: 'blue' },
  { role: 'TEACHER', label: 'Professor', icon: <User2 size={18} />, color: 'purple' },
  { role: 'ADMIN', label: 'Admin', icon: <ShieldCheck size={18} />, color: 'orange' },
];

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RoleTab>('STUDENT');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('2A');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      name,
      grade: activeTab === 'STUDENT' ? grade : undefined,
      password,
      role: activeTab,
    });

    setLoading(false);

    if (res?.ok) {
      router.push('/dashboard');
    } else {
      setError('Nome, série ou senha incorretos. Verifique os dados e tente novamente.');
    }
  }

  const activeColor = tabs.find((t) => t.role === activeTab)?.color ?? 'blue';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl mb-4">
            <BookOpen size={30} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            SAMBA
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Sistema de Acompanhamento do Aluno
          </p>
        </div>

        <div className="card p-8 shadow-xl">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-xl">
            {tabs.map((t) => (
              <button
                key={t.role}
                onClick={() => { setActiveTab(t.role); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === t.role
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Nome
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {activeTab === 'STUDENT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Série / Turma
                </label>
                <select
                  className="input-field"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                >
                  {GRADES_LIST.map((g) => (
                    <option key={g} value={g}>
                      {g.startsWith('2') ? `${g} – Ensino Médio` : `${g} – Ensino Fundamental`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {tabs.find((t) => t.role === activeTab)?.icon}
                  Entrar como {tabs.find((t) => t.role === activeTab)?.label}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-slate-600 mt-6">
          SAMBA © 2026 · Módulo Escolar
        </p>
      </div>
    </div>
  );
}
