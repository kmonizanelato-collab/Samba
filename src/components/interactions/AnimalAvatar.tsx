import { CharacterAvatar } from './CharacterAvatar';
import { Outfit } from '@/lib/interactions';

interface Props {
  animal: string;
  outfit?: Partial<Outfit>;
  size?: number;
  animated?: boolean;
  selected?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function AnimalAvatar({ animal, outfit, size = 64, animated = true, selected = false, glow = false, onClick }: Props) {
  const ring = selected
    ? 'ring-4 ring-amber-400 shadow-xl shadow-amber-400/50 scale-105'
    : 'ring-2 ring-white/60 dark:ring-white/15';
  const interactive = onClick ? 'hover:scale-110 hover:ring-amber-300 active:scale-95 cursor-pointer' : '';
  const className = `relative inline-flex items-center justify-center rounded-full overflow-hidden transition-all duration-300 ${ring} ${interactive}`;
  const style = { width: size, height: size };

  const inner = (
    <>
      {glow && (
        <span
          className="absolute inset-0 rounded-full z-10 pointer-events-none"
          style={{ boxShadow: '0 0 24px 4px rgba(255, 223, 128, 0.55)' }}
        />
      )}
      <CharacterAvatar
        animal={animal}
        outfit={outfit}
        size={size}
        pose="bust"
        framed
        className={animated ? 'jungle-idle' : ''}
      />
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style}>
        {inner}
      </button>
    );
  }
  return (
    <div className={className} style={style}>
      {inner}
    </div>
  );
}
