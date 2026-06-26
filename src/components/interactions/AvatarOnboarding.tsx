'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { Sparkles, Shirt, Crown, Glasses, Palette, Check } from 'lucide-react';
import {
  JUNGLE_ANIMALS,
  HATS,
  TOPS,
  ACCESSORIES,
  BG_OPTIONS,
  DEFAULT_OUTFIT,
  Outfit,
  OutfitOption,
} from '@/lib/interactions';
import { CharacterAvatar } from './CharacterAvatar';

interface Props {
  session: Session;
}

type TabKey = 'hat' | 'top' | 'accessory' | 'bg';

const TABS: { key: TabKey; label: string; icon: React.ElementType; options: OutfitOption[] }[] = [
  { key: 'hat', label: 'Chapéu', icon: Crown, options: HATS },
  { key: 'top', label: 'Roupa', icon: Shirt, options: TOPS },
  { key: 'accessory', label: 'Acessório', icon: Glasses, options: ACCESSORIES },
  { key: 'bg', label: 'Fundo', icon: Palette, options: BG_OPTIONS },
];

export function AvatarOnboarding({ session }: Props) {
  const router = useRouter();
  const [animal, setAnimal] = useState<string>('lion');
  const [outfit, setOutfit] = useState<Outfit>({ ...DEFAULT_OUTFIT });
  const [tab, setTab] = useState<TabKey>('hat');
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/interactions/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setAnimal(d.profile.avatar);
          setOutfit({
            hat: d.profile.hat ?? 'none',
            top: d.profile.top ?? 'none',
            accessory: d.profile.accessory ?? 'none',
            bg: d.profile.bg ?? 'mint',
          });
          setIsEdit(true);
        }
      })
      .catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    setError('');
    const res = await fetch('/api/interactions/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: animal, ...outfit }),
    });
    if (res.ok) {
      router.push('/interactions');
      router.refresh();
    } else {
      setSaving(false);
      setError('Não foi possível salvar. Tente novamente.');
    }
  }

  const activeTab = TABS.find((t) => t.key === tab)!;
  const animalLabel = JUNGLE_ANIMALS.find((a) => a.key === animal)?.label ?? '';

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-100 via-rose-50 to-emerald-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 px-4 py-8 sm:py-12 flex items-center justify-center">
      <div className="jungle-pop w-full max-w-4xl rounded-3xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
        <div className="grid md:grid-cols-[300px_1fr]">
          {/* Preview */}
          <div className="relative bg-gradient-to-b from-emerald-400/20 to-teal-500/10 dark:from-emerald-500/10 dark:to-teal-500/5 p-6 flex flex-col items-center justify-center gap-3 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/10">
            <div className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-widest">
              <Sparkles size={13} /> Seu personagem
            </div>
            <div className="j-float drop-shadow-xl">
              <CharacterAvatar animal={animal} outfit={outfit} size={200} />
            </div>
            <div className="text-center">
              <div className="font-extrabold text-lg text-gray-900 dark:text-slate-50">{session.user.name}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">{animalLabel} · {session.user.grade}</div>
            </div>
          </div>

          {/* Controles */}
          <div className="p-6 sm:p-7">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-slate-50">
              {isEdit ? 'Personalizar visual' : 'Monte seu personagem'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 mb-4">
              Escolha o animal e capriche no look — ele vira sua foto de perfil.
            </p>

            {/* Seletor de animal */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {JUNGLE_ANIMALS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setAnimal(a.key)}
                  title={a.label}
                  className={`shrink-0 rounded-2xl p-0.5 transition-all ${
                    animal === a.key ? 'ring-2 ring-emerald-500 scale-105' : 'ring-1 ring-black/5 dark:ring-white/10 opacity-80 hover:opacity-100'
                  }`}
                >
                  <CharacterAvatar animal={a.key} outfit={{ bg: outfit.bg }} size={52} className="rounded-2xl" />
                </button>
              ))}
            </div>

            {/* Abas */}
            <div className="flex gap-1.5 mt-4 mb-3 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      tab === t.key
                        ? 'bg-white dark:bg-slate-700 shadow text-emerald-700 dark:text-emerald-300'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={15} /> <span className="hidden sm:inline">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Opções da aba */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
              {activeTab.options.map((opt) => {
                const selected = outfit[tab] === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setOutfit((o) => ({ ...o, [tab]: opt.key }))}
                    title={opt.label}
                    className={`relative rounded-2xl p-1.5 flex flex-col items-center gap-1 border-2 transition-all ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-transparent bg-gray-50 dark:bg-slate-800/60 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {selected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                    {tab === 'bg' ? (
                      <span className="w-11 h-11 rounded-full shadow-inner" style={{ background: opt.swatch }} />
                    ) : (
                      <CharacterAvatar animal={animal} outfit={{ ...outfit, [tab]: opt.key }} size={52} />
                    )}
                    <span className="text-[10px] font-medium text-gray-600 dark:text-slate-300 leading-tight text-center truncate w-full">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}

            <button
              onClick={save}
              disabled={saving}
              className="w-full mt-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
            >
              {saving ? 'Salvando...' : isEdit ? 'Salvar visual ✨' : 'Entrar no chalé 🏕️'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
