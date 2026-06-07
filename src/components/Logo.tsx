interface Props {
  variant?: 'bar' | 'hero';
}

/** Marca SAMBA: símbolo em espiral (swirl) azul + wordmark "samba innovations." */
export function Logo({ variant = 'bar' }: Props) {
  const hero = variant === 'hero';
  const iconSize = hero ? 64 : 38;

  return (
    <div className={`flex items-center ${hero ? 'gap-3' : 'gap-2.5'}`}>
      <Swirl size={iconSize} />
      <div className="flex flex-col leading-none">
        <span
          className={`font-brand font-extrabold lowercase tracking-tight text-blue-600 dark:text-blue-400 ${hero ? 'text-5xl' : 'text-[26px]'}`}
        >
          samba
        </span>
        <span
          className={`font-brand font-semibold lowercase text-blue-500/90 dark:text-blue-400/80 ${hero ? 'text-base -mt-1 ml-0.5' : 'text-[11px] -mt-0.5 ml-0.5'}`}
        >
          innovations.
        </span>
      </div>
    </div>
  );
}

/** Espiral azul sólida (traço grosso com pontas arredondadas, ~1,3 voltas). */
function Swirl({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-blue-600 dark:text-blue-400 shrink-0"
    >
      <path
        d="M30 13C41 12 50 20 49 31C48 41 40 47 31 46C23 45 17 39 18 31C19 25 24 21 30 22C35 23 38 27 37 32"
        stroke="currentColor"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
