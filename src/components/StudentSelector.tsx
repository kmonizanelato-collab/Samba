'use client';
import { useMemo, useState } from 'react';
import {
  X,
  ChevronLeft,
  GraduationCap,
  School,
  Users,
  Search,
  Check,
} from 'lucide-react';
import {
  FUNDAMENTAL_ROOMS,
  MEDIO_ROOMS,
  roomLabel,
} from '@/lib/constants';

export interface StudentOption {
  id: number;
  name: string;
  grade: string;
  level: string;
}

interface Props {
  students: StudentOption[];
  selectedId: number | null;
  onSelect: (student: StudentOption) => void;
  onClose: () => void;
  /** Tailwind accent color, ex: 'blue' | 'purple' | 'emerald' */
  accent?: 'blue' | 'purple' | 'emerald';
}

const ACCENTS = {
  blue: {
    ring: 'ring-blue-500',
    bg: 'bg-blue-600',
    soft: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    ring: 'ring-purple-500',
    bg: 'bg-purple-600',
    soft: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-600',
    text: 'text-purple-600 dark:text-purple-400',
  },
  emerald: {
    ring: 'ring-emerald-500',
    bg: 'bg-emerald-600',
    soft: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-600',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
};

export function StudentSelector({
  students,
  selectedId,
  onSelect,
  onClose,
  accent = 'blue',
}: Props) {
  const a = ACCENTS[accent];
  const current = students.find((s) => s.id === selectedId);
  const [room, setRoom] = useState<string | null>(current?.grade ?? null);
  const [query, setQuery] = useState('');

  const countByRoom = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of students) m[s.grade] = (m[s.grade] || 0) + 1;
    return m;
  }, [students]);

  const roomStudents = useMemo(() => {
    if (!room) return [];
    return students
      .filter((s) => s.grade === room)
      .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
      .sort((x, y) => x.name.localeCompare(y.name));
  }, [room, students, query]);

  function RoomGrid({ rooms }: { rooms: string[] }) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {rooms.map((r) => {
          const count = countByRoom[r] ?? 0;
          const empty = count === 0;
          return (
            <button
              key={r}
              disabled={empty}
              onClick={() => {
                setRoom(r);
                setQuery('');
              }}
              className={`relative flex flex-col items-center justify-center py-3 rounded-xl border text-sm font-semibold transition-all
                ${empty
                  ? 'border-gray-100 dark:border-slate-700/50 text-gray-300 dark:text-slate-600 cursor-not-allowed'
                  : `border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:${a.border} hover:${a.text} hover:-translate-y-0.5 hover:shadow-md cursor-pointer`
                }`}
            >
              <span>{r}</span>
              <span className={`text-[10px] font-medium mt-0.5 ${empty ? 'text-gray-300 dark:text-slate-600' : 'text-gray-400 dark:text-slate-500'}`}>
                {count} {count === 1 ? 'aluno' : 'alunos'}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {room ? (
              <button
                onClick={() => setRoom(null)}
                className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
                title="Voltar para salas"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <Users size={18} className={a.text} />
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-50">
              {room ? roomLabel(room) : 'Selecione a sala'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: rooms */}
        {!room && (
          <div className="overflow-y-auto scrollbar-thin -mx-1 px-1 space-y-5">
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                <School size={14} /> Ensino Fundamental
              </div>
              <RoomGrid rooms={FUNDAMENTAL_ROOMS} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                <GraduationCap size={14} /> Ensino Médio
              </div>
              <RoomGrid rooms={MEDIO_ROOMS} />
            </div>
          </div>
        )}

        {/* Step 2: students */}
        {room && (
          <div className="flex flex-col min-h-0">
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar aluno..."
                className="input-field pl-9 py-2 text-sm"
              />
            </div>

            {roomStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 dark:text-slate-500">
                <Users size={28} className="mb-2 opacity-50" />
                <p className="text-sm">
                  {query
                    ? 'Nenhum aluno encontrado.'
                    : 'Nenhum aluno cadastrado nesta sala ainda.'}
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto scrollbar-thin space-y-1 -mx-1 px-1">
                {roomStudents.map((s) => {
                  const selected = s.id === selectedId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelect(s);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors
                        ${selected ? a.soft : 'hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-200'}`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${a.bg}`}>
                        {s.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="flex-1 font-medium">{s.name}</span>
                      {selected && <Check size={16} className={a.text} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
