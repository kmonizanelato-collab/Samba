import { bgColor } from '@/lib/interactions';

interface Props {
  animal: string;
  hat?: string | null;
  accessory?: string | null;
  bg?: string | null;
  size?: number;
  selected?: boolean;
  onClick?: () => void;
}

export function AnimalAvatar({ animal, hat, accessory, bg, size = 64, selected = false, onClick }: Props) {
  const state = selected
    ? 'border-blue-500 ring-2 ring-blue-500/30 dark:border-blue-400'
    : 'border-gray-200 dark:border-slate-700';
  const hover = onClick ? 'hover:border-blue-300 dark:hover:border-blue-600 hover:scale-105 active:scale-95 cursor-pointer' : '';

  const content = (
    <span
      className={`relative inline-block rounded-full border ${state} ${hover} transition-all duration-200`}
      style={{ width: size, height: size, background: bgColor(bg) }}
    >
      {/* animal */}
      <img
        src={`/interactions/avatars/${animal}.svg`}
        alt={animal}
        draggable={false}
        className="absolute object-contain select-none"
        style={{ inset: size * 0.14 }}
      />
      {/* óculos */}
      {accessory && accessory !== 'none' && (
        <img
          src={`/interactions/cosmetics/${accessory}.svg`}
          alt=""
          draggable={false}
          className="absolute object-contain select-none pointer-events-none"
          style={{ width: size * 0.56, left: '50%', top: '46%', transform: 'translate(-50%, -50%)' }}
        />
      )}
      {/* chapéu */}
      {hat && hat !== 'none' && (
        <img
          src={`/interactions/cosmetics/${hat}.svg`}
          alt=""
          draggable={false}
          className="absolute object-contain select-none pointer-events-none drop-shadow-sm"
          style={{ width: size * 0.52, left: '50%', top: size * -0.04, transform: 'translateX(-50%)' }}
        />
      )}
    </span>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="inline-flex p-0 bg-transparent border-0">
        {content}
      </button>
    );
  }
  return content;
}
