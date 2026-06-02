'use client';
import { signOut, useSession } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, Home, BookOpen, User2 } from 'lucide-react';
import Link from 'next/link';

const roleBadge: Record<string, { label: string; cls: string }> = {
  STUDENT: { label: 'Aluno', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  TEACHER: { label: 'Professor', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  ADMIN: { label: 'Admin', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
};

export function Navbar() {
  const { data: session } = useSession();
  if (!session) return null;

  const badge = roleBadge[session.user.role] ?? roleBadge.STUDENT;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
              SAMBA
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
              <User2 size={15} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {session.user.name}
              </span>
              {session.user.grade && (
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  • {session.user.grade}
                </span>
              )}
              <span className={`badge ${badge.cls}`}>{badge.label}</span>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-sm font-medium"
              title="Voltar para a área inicial"
            >
              <Home size={17} />
              <span className="hidden sm:inline">Início</span>
            </Link>
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 text-sm font-medium"
              title="Desconectar da conta"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
