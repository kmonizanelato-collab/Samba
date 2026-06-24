interface Props {
  animal: string;
  size?: number;
  animated?: boolean;
  selected?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function AnimalAvatar({ animal, size = 64, animated = true, selected = false, glow = false, onClick }: Props) {
  const ring = selected
    ? 'ring-4 ring-amber-400 shadow-xl shadow-amber-400/50 scale-105'
    : 'ring-2 ring-white/50';
  const interactive = onClick ? 'hover:scale-110 hover:ring-amber-300 active:scale-95 cursor-pointer' : '';
  const className = `relative inline-flex items-center justify-center rounded-full bg-gradient-to-b from-white/90 to-white/60 dark:from-white/15 dark:to-white/5 backdrop-blur-sm transition-all duration-300 ${ring} ${interactive}`;
  const style = { width: size, height: size, padding: size * 0.13 };

  const inner = (
    <>
      {glow && (
        <span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: '0 0 24px 4px rgba(255, 223, 128, 0.55)' }}
        />
      )}
      <img
        src={`/interactions/avatars/${animal}.svg`}
        alt={animal}
        draggable={false}
        className={`relative w-full h-full object-contain select-none ${animated ? 'jungle-idle' : ''}`}
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
