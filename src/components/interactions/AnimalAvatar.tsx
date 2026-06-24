interface Props {
  animal: string;
  size?: number;
  animated?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function AnimalAvatar({ animal, size = 64, animated = true, selected = false, onClick }: Props) {
  const className = `relative inline-flex items-center justify-center rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-sm transition-all duration-300 ${
    selected ? 'ring-4 ring-amber-400 shadow-lg shadow-amber-400/40 scale-105' : 'ring-2 ring-white/40'
  } ${onClick ? 'hover:scale-110 hover:ring-amber-300 active:scale-95' : ''}`;
  const style = { width: size, height: size, padding: size * 0.12 };
  const img = (
    <img
      src={`/interactions/avatars/${animal}.svg`}
      alt={animal}
      draggable={false}
      className={`w-full h-full object-contain select-none ${animated ? 'jungle-idle' : ''}`}
    />
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style}>
        {img}
      </button>
    );
  }
  return (
    <div className={className} style={style}>
      {img}
    </div>
  );
}
