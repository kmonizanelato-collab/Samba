'use client';
import { useState } from 'react';
import { PawPrint, Crown, Glasses, Palette, Check, Ban } from 'lucide-react';
import { ANIMALS, HATS, GLASSES, BGS, AvatarLook, bgColor } from '@/lib/interactions';
import { AnimalAvatar } from './AnimalAvatar';

type TabKey = 'animal' | 'hat' | 'accessory' | 'bg';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'animal', label: 'Animal', icon: PawPrint },
  { key: 'hat', label: 'Chapéu', icon: Crown },
  { key: 'accessory', label: 'Óculos', icon: Glasses },
  { key: 'bg', label: 'Fundo', icon: Palette },
];

export function AvatarCustomizer({ look, onChange }: { look: AvatarLook; onChange: (l: AvatarLook) => void }) {
  const [tab, setTab] = useState<TabKey>('animal');

  function set(part: Partial<AvatarLook>) {
    onChange({ ...look, ...part });
  }

  return (
    <div>
      {/* Preview */}
      <div className="flex flex-col items-center">
        <div
          className="rounded-3xl p-5 shadow-inner"
          style={{ background: `linear-gradient(160deg, ${bgColor(look.bg)}55, ${bgColor(look.bg)}22)` }}
        >
          <AnimalAvatar {...look} size={132} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mt-5 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${active ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400'}`}
            >
              <Icon size={15} /> <span className="hidden xs:inline sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Opções */}
      <div className="mt-4 max-h-[244px] overflow-y-auto scrollbar-thin pr-1">
        {tab === 'animal' && (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
            {ANIMALS.map((a) => (
              <button key={a.key} onClick={() => set({ animal: a.key })} title={a.label} className="flex flex-col items-center gap-1">
                <AnimalAvatar animal={a.key} bg={look.bg} size={56} selected={look.animal === a.key} />
                <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate w-full text-center">{a.label}</span>
              </button>
            ))}
          </div>
        )}

        {(tab === 'hat' || tab === 'accessory') && (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
            {(tab === 'hat' ? HATS : GLASSES).map((opt) => {
              const selected = look[tab] === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => set({ [tab]: opt.key } as Partial<AvatarLook>)}
                  title={opt.label}
                  className={`relative rounded-2xl border-2 p-1.5 flex flex-col items-center justify-center gap-1 aspect-square transition-all ${selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                >
                  {selected && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  {opt.key === 'none' ? (
                    <Ban size={26} className="text-gray-300 dark:text-slate-600" />
                  ) : (
                    <img src={`/interactions/cosmetics/${opt.key}.svg`} alt={opt.label} className="w-9 h-9 object-contain" draggable={false} />
                  )}
                  <span className="text-[9px] text-gray-500 dark:text-slate-400 truncate w-full text-center leading-none">{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {tab === 'bg' && (
          <div className="grid grid-cols-5 gap-3">
            {BGS.map((b) => {
              const selected = look.bg === b.key;
              return (
                <button key={b.key} onClick={() => set({ bg: b.key })} title={b.label} className="flex flex-col items-center gap-1">
                  <span
                    className={`w-12 h-12 rounded-full shadow-inner border-2 flex items-center justify-center ${selected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-white dark:border-slate-700'}`}
                    style={{ background: b.color }}
                  >
                    {selected && <Check size={18} className="text-white drop-shadow" strokeWidth={3} />}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400">{b.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
