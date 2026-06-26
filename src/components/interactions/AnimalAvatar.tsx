interface Props {
  animal: string;
  size?: number;
  selected?: boolean;
  onClick?: () => void;
}

export function AnimalAvatar({ animal, size = 64, selected = false, onClick }: Props) {
  const base = 'relative inline-flex items-center justify-center rounded-full bg-gray-50 dark:bg-slate-800 border transition-all duration-200';
  const state = selected
    ? 'border-blue-500 ring-2 ring-blue-500/30 dark:border-blue-400'
    : 'border-gray-200 dark:border-slate-700';
  const hover = onClick ? 'hover:border-blue-300 dark:hover:border-blue-600 hover:scale-105 active:scale-95 cursor-pointer' : '';
  const style = { width: size, height: size, padding: size * 0.14 };

  const img = (
    <img
      src={`/interactions/avatars/${animal}.svg`}
      alt={animal}
      draggable={false}
      className="w-full h-full object-contain select-none"
    />
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${state} ${hover}`} style={style}>
        {img}
      </button>
    );
  }
  return (
    <div className={`${base} ${state}`} style={style}>
      {img}
    </div>
  );
}
