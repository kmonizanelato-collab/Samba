import { Outfit } from '@/lib/interactions';

/* ============================================================
   CharacterAvatar — boneco vestível em SVG por camadas.
   Poses: 'bust' (foto de perfil / seletores) e 'sit' (poltrona).
   Sem imagens externas: tudo desenhado, estilo flat fofo.
   ============================================================ */

interface Palette {
  fur: string;
  furDark: string;
  belly: string;
  ear: string;
  earInner: string;
}

const PALETTES: Record<string, Palette> = {
  lion: { fur: '#E8A33D', furDark: '#CC861F', belly: '#F6DCAE', ear: '#D98E2C', earInner: '#B5651D' },
  tiger: { fur: '#F2A24E', furDark: '#D9822B', belly: '#FBE3C2', ear: '#E0892F', earInner: '#C26A1E' },
  monkey: { fur: '#B07A4D', furDark: '#8E5E36', belly: '#E7C49C', ear: '#B07A4D', earInner: '#E7C49C' },
  elephant: { fur: '#A8B2BD', furDark: '#8893A0', belly: '#C8D1D9', ear: '#B6C0CA', earInner: '#CBD3DB' },
  giraffe: { fur: '#ECC56B', furDark: '#C99B3F', belly: '#F6E2AE', ear: '#E0B65A', earInner: '#C99B3F' },
  zebra: { fur: '#F4F4F4', furDark: '#D2D2D2', belly: '#FFFFFF', ear: '#ECECEC', earInner: '#CFCFCF' },
  panda: { fur: '#F6F6F6', furDark: '#E2E2E2', belly: '#FFFFFF', ear: '#2A2A2A', earInner: '#5A5A5A' },
  parrot: { fur: '#34C26B', furDark: '#23A557', belly: '#F6E58D', ear: '#2BA85C', earInner: '#1E8E4C' },
};

const BG_GRAD: Record<string, [string, string]> = {
  mint: ['#A7F3D0', '#5EEAD4'],
  sky: ['#BAE6FD', '#7DD3FC'],
  peach: ['#FED7AA', '#FDBA74'],
  rose: ['#FECDD3', '#FDA4AF'],
  violet: ['#DDD6FE', '#C4B5FD'],
  sun: ['#FDE68A', '#FCD34D'],
  slate: ['#CBD5E1', '#94A3B8'],
  forest: ['#6EE7B7', '#34D399'],
};

const TOP_COLORS: Record<string, { main: string; dark: string; accent: string }> = {
  tshirt: { main: '#3B82F6', dark: '#2563EB', accent: '#93C5FD' },
  hoodie: { main: '#10B981', dark: '#059669', accent: '#6EE7B7' },
  striped: { main: '#F8FAFC', dark: '#E2E8F0', accent: '#1E293B' },
  jersey: { main: '#EF4444', dark: '#DC2626', accent: '#FEF3C7' },
  dress: { main: '#EC4899', dark: '#DB2777', accent: '#FBCFE8' },
  jacket: { main: '#475569', dark: '#334155', accent: '#F59E0B' },
  sweater: { main: '#8B5CF6', dark: '#7C3AED', accent: '#DDD6FE' },
};

/* ---------- orelhas (atrás da cabeça) ---------- */
function Ears({ animal, p }: { animal: string; p: Palette }) {
  switch (animal) {
    case 'lion':
    case 'tiger':
      return (
        <g>
          <circle cx="72" cy="52" r="20" fill={p.ear} />
          <circle cx="168" cy="52" r="20" fill={p.ear} />
          <circle cx="72" cy="52" r="10" fill={p.earInner} />
          <circle cx="168" cy="52" r="10" fill={p.earInner} />
        </g>
      );
    case 'monkey':
      return (
        <g>
          <circle cx="58" cy="96" r="22" fill={p.ear} />
          <circle cx="182" cy="96" r="22" fill={p.ear} />
          <circle cx="58" cy="96" r="12" fill={p.earInner} />
          <circle cx="182" cy="96" r="12" fill={p.earInner} />
        </g>
      );
    case 'panda':
      return (
        <g>
          <circle cx="66" cy="48" r="24" fill={p.ear} />
          <circle cx="174" cy="48" r="24" fill={p.ear} />
        </g>
      );
    case 'elephant':
      return (
        <g>
          <ellipse cx="52" cy="100" rx="34" ry="42" fill={p.ear} />
          <ellipse cx="188" cy="100" rx="34" ry="42" fill={p.ear} />
          <ellipse cx="58" cy="100" rx="20" ry="28" fill={p.earInner} />
          <ellipse cx="182" cy="100" rx="20" ry="28" fill={p.earInner} />
        </g>
      );
    case 'giraffe':
      return (
        <g>
          {/* ossículos (chifrinhos) */}
          <rect x="84" y="24" width="9" height="26" rx="4" fill={p.furDark} />
          <circle cx="88" cy="22" r="8" fill={p.furDark} />
          <rect x="147" y="24" width="9" height="26" rx="4" fill={p.furDark} />
          <circle cx="152" cy="22" r="8" fill={p.furDark} />
          <ellipse cx="62" cy="64" rx="18" ry="13" fill={p.ear} transform="rotate(-25 62 64)" />
          <ellipse cx="178" cy="64" rx="18" ry="13" fill={p.ear} transform="rotate(25 178 64)" />
        </g>
      );
    case 'zebra':
      return (
        <g>
          {/* crina moicano */}
          <path d="M104 30 q16 -16 32 0 v8 h-32 z" fill="#2C2C2C" />
          <rect x="116" y="20" width="8" height="20" rx="3" fill="#2C2C2C" />
          <ellipse cx="74" cy="54" rx="16" ry="20" fill={p.ear} />
          <ellipse cx="166" cy="54" rx="16" ry="20" fill={p.ear} />
          <ellipse cx="74" cy="56" rx="8" ry="11" fill="#2C2C2C" />
          <ellipse cx="166" cy="56" rx="8" ry="11" fill="#2C2C2C" />
        </g>
      );
    case 'parrot':
      return (
        <g>
          {/* topete de penas */}
          <path d="M120 30 q-20 -22 -30 -2 q18 -6 30 8 z" fill="#E74C3C" />
          <path d="M120 28 q0 -26 0 -4 z" fill="#F39C12" />
          <path d="M120 30 q20 -22 30 -2 q-18 -6 -30 8 z" fill="#F1C40F" />
        </g>
      );
    default:
      return null;
  }
}

/* ---------- detalhes do rosto (sobre a cabeça) ---------- */
function FaceExtras({ animal, p }: { animal: string; p: Palette }) {
  const els: React.ReactNode[] = [];
  if (animal === 'lion') {
    // juba ao redor (atrás) — desenhada como coroa de pétalas
    els.push(
      <g key="mane">
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const cx = 120 + Math.cos(a) * 74;
          const cy = 96 + Math.sin(a) * 70;
          return <circle key={i} cx={cx} cy={cy} r="18" fill={i % 2 ? '#8B4D17' : '#A85D1E'} />;
        })}
      </g>,
    );
  }
  if (animal === 'panda') {
    els.push(
      <g key="patch">
        <ellipse cx="92" cy="100" rx="20" ry="25" fill="#2A2A2A" transform="rotate(-18 92 100)" />
        <ellipse cx="148" cy="100" rx="20" ry="25" fill="#2A2A2A" transform="rotate(18 148 100)" />
      </g>,
    );
  }
  if (animal === 'tiger') {
    els.push(
      <g key="stripes" fill="#5B3A1E">
        <path d="M120 38 q6 14 0 26 q-6 -12 0 -26z" />
        <path d="M150 50 q14 8 18 22 q-16 -4 -18 -22z" />
        <path d="M90 50 q-14 8 -18 22 q16 -4 18 -22z" />
      </g>,
    );
  }
  if (animal === 'zebra') {
    els.push(
      <g key="zstripes" fill="#2C2C2C">
        <path d="M120 40 q5 12 0 24 q-5 -12 0 -24z" />
        <path d="M152 56 q12 6 15 18 q-14 -2 -15 -18z" />
        <path d="M88 56 q-12 6 -15 18 q14 -2 15 -18z" />
        <path d="M150 132 q14 4 20 -2 q-12 12 -20 2z" />
        <path d="M90 132 q-14 4 -20 -2 q12 12 20 2z" />
      </g>,
    );
  }
  if (animal === 'giraffe') {
    els.push(
      <g key="spots" fill={p.furDark} opacity="0.85">
        <circle cx="80" cy="72" r="9" />
        <circle cx="158" cy="74" r="8" />
        <circle cx="72" cy="116" r="8" />
        <circle cx="166" cy="118" r="9" />
        <circle cx="120" cy="58" r="7" />
      </g>,
    );
  }
  return <>{els}</>;
}

/* ---------- focinho + olhos + boca ---------- */
function Face({ animal, p }: { animal: string; p: Palette }) {
  const eyeY = 102;
  const isParrot = animal === 'parrot';
  return (
    <g>
      {/* focinho claro */}
      {!isParrot && <ellipse cx="120" cy="132" rx="40" ry="32" fill={p.belly} />}
      {isParrot && <ellipse cx="120" cy="118" rx="46" ry="30" fill={p.belly} opacity="0.5" />}

      {/* bochechas */}
      <ellipse cx="78" cy="124" rx="13" ry="9" fill="#F9A8D4" opacity="0.55" />
      <ellipse cx="162" cy="124" rx="13" ry="9" fill="#F9A8D4" opacity="0.55" />

      {/* olhos */}
      <ellipse cx="96" cy={eyeY} rx="11" ry="13" fill="#FFFFFF" />
      <ellipse cx="144" cy={eyeY} rx="11" ry="13" fill="#FFFFFF" />
      <circle cx="98" cy={eyeY + 1} r="6.5" fill="#2B2118" />
      <circle cx="146" cy={eyeY + 1} r="6.5" fill="#2B2118" />
      <circle cx="100" cy={eyeY - 2} r="2.2" fill="#FFFFFF" />
      <circle cx="148" cy={eyeY - 2} r="2.2" fill="#FFFFFF" />

      {/* nariz / bico */}
      {isParrot ? (
        <g>
          <path d="M104 122 q16 -16 32 0 q-6 22 -16 26 q-10 -4 -16 -26z" fill="#F39C12" />
          <path d="M120 148 q-6 -2 -16 -26 q16 8 16 8z" fill="#D68910" />
        </g>
      ) : (
        <g>
          <ellipse cx="120" cy="128" rx="9" ry="6.5" fill="#3A2A1E" />
          <path d="M120 134 v9" stroke="#3A2A1E" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M120 143 q-9 9 -18 2 M120 143 q9 9 18 2" stroke="#3A2A1E" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )}
    </g>
  );
}

/* ---------- corpo (busto ou sentado) ---------- */
function Body({ pose, color }: { pose: 'bust' | 'sit'; color: string }) {
  if (pose === 'bust') {
    return <path d="M30 240 q0 -78 90 -78 q90 0 90 78 z" fill={color} />;
  }
  // sentado: tronco + perninhas dobradas + patas
  return (
    <g>
      <ellipse cx="120" cy="196" rx="66" ry="56" fill={color} />
      {/* perninhas para frente */}
      <ellipse cx="92" cy="244" rx="22" ry="15" fill={color} />
      <ellipse cx="148" cy="244" rx="22" ry="15" fill={color} />
      <ellipse cx="78" cy="248" rx="13" ry="9" fill="#00000022" />
      <ellipse cx="162" cy="248" rx="13" ry="9" fill="#00000022" />
    </g>
  );
}

/* ---------- roupa por cima do corpo ---------- */
function TopClothes({ top, pose }: { top: string; pose: 'bust' | 'sit' }) {
  if (top === 'none') return null;
  const c = TOP_COLORS[top];
  if (!c) return null;
  const baseY = pose === 'bust' ? 162 : 150;
  const els: React.ReactNode[] = [];

  // corpo da roupa (acompanha o tronco)
  if (pose === 'bust') {
    els.push(<path key="b" d="M34 240 q0 -74 86 -74 q86 0 86 74 z" fill={c.main} />);
    els.push(<path key="collar" d="M92 172 q28 26 56 0 q-4 16 -28 16 q-24 0 -28 -16z" fill={c.dark} />);
  } else {
    els.push(<ellipse key="b" cx="120" cy="198" rx="62" ry="52" fill={c.main} />);
  }

  if (top === 'striped') {
    els.push(
      <g key="st" stroke={c.accent} strokeWidth="9" opacity="0.9">
        <line x1="40" y1={baseY + 28} x2="200" y2={baseY + 28} />
        <line x1="34" y1={baseY + 50} x2="206" y2={baseY + 50} />
        <line x1="34" y1={baseY + 72} x2="206" y2={baseY + 72} />
      </g>,
    );
  }
  if (top === 'jersey') {
    els.push(<text key="num" x="120" y={baseY + 70} textAnchor="middle" fontSize="44" fontWeight="900" fill={c.accent} fontFamily="system-ui">10</text>);
  }
  if (top === 'hoodie') {
    els.push(<path key="hd" d="M86 168 q34 30 68 0 q-2 22 -34 22 q-32 0 -34 -22z" fill={c.dark} />);
    els.push(<line key="z" x1="120" y1="188" x2="120" y2="240" stroke={c.dark} strokeWidth="4" />);
  }
  if (top === 'jacket') {
    els.push(<line key="zip" x1="120" y1="172" x2="120" y2="244" stroke={c.dark} strokeWidth="5" />);
    els.push(<circle key="b1" cx="120" cy="200" r="4" fill={c.accent} />);
    els.push(<circle key="b2" cx="120" cy="222" r="4" fill={c.accent} />);
  }
  if (top === 'sweater') {
    els.push(<path key="v" d="M96 172 q24 22 48 0" stroke={c.accent} strokeWidth="6" fill="none" />);
  }
  if (top === 'dress') {
    els.push(<path key="bow" d="M112 178 l-12 -6 v12z M128 178 l12 -6 v12z" fill={c.accent} />);
    els.push(<circle key="bowc" cx="120" cy="178" r="5" fill={c.accent} />);
  }
  return <g>{els}</g>;
}

/* ---------- chapéu ---------- */
function Hat({ hat }: { hat: string }) {
  switch (hat) {
    case 'cap':
      return (
        <g>
          <path d="M68 56 a52 52 0 0 1 104 0 z" fill="#EF4444" />
          <path d="M120 56 a52 52 0 0 1 52 0 q26 2 30 16 q-40 -6 -82 -16z" fill="#DC2626" />
          <circle cx="120" cy="12" r="6" fill="#B91C1C" />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path d="M64 60 a56 56 0 0 1 112 0 z" fill="#6366F1" />
          <rect x="60" y="54" width="120" height="16" rx="8" fill="#4F46E5" />
          <circle cx="120" cy="6" r="9" fill="#A5B4FC" />
        </g>
      );
    case 'party':
      return (
        <g>
          <path d="M120 -16 L150 56 L90 56 z" fill="#F472B6" />
          <path d="M120 -16 L138 28 L102 28 z" fill="#FBBF24" />
          <circle cx="120" cy="-16" r="8" fill="#FDE68A" />
        </g>
      );
    case 'graduation':
      return (
        <g>
          <rect x="74" y="46" width="92" height="20" rx="4" fill="#1F2937" />
          <rect x="50" y="32" width="140" height="18" rx="3" fill="#111827" transform="skewX(0)" />
          <polygon points="120,24 196,42 120,60 44,42" fill="#1F2937" />
          <circle cx="120" cy="42" r="5" fill="#FBBF24" />
          <path d="M120 42 q34 4 34 22" stroke="#FBBF24" strokeWidth="3" fill="none" />
          <circle cx="154" cy="66" r="5" fill="#FBBF24" />
        </g>
      );
    case 'crown':
      return (
        <g>
          <path d="M70 56 L70 20 L94 40 L120 12 L146 40 L170 20 L170 56 z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="120" cy="22" r="5" fill="#F87171" />
          <circle cx="78" cy="26" r="4" fill="#60A5FA" />
          <circle cx="162" cy="26" r="4" fill="#60A5FA" />
        </g>
      );
    case 'flower':
      return (
        <g transform="translate(158 44)">
          {Array.from({ length: 5 }).map((_, i) => {
            const a = (i / 5) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(a) * 12} cy={Math.sin(a) * 12} r="9" fill="#F472B6" />;
          })}
          <circle cx="0" cy="0" r="7" fill="#FDE68A" />
        </g>
      );
    case 'headphones':
      return (
        <g>
          <path d="M62 96 q0 -78 116 0" stroke="#1F2937" strokeWidth="10" fill="none" />
          <rect x="50" y="86" width="22" height="34" rx="8" fill="#111827" />
          <rect x="168" y="86" width="22" height="34" rx="8" fill="#111827" />
          <rect x="54" y="92" width="14" height="22" rx="6" fill="#6366F1" />
          <rect x="172" y="92" width="14" height="22" rx="6" fill="#6366F1" />
        </g>
      );
    case 'wizard':
      return (
        <g>
          <path d="M120 -28 L160 58 L80 58 z" fill="#6D28D9" />
          <path d="M70 56 q50 14 100 0 q0 12 -50 12 q-50 0 -50 -12z" fill="#5B21B6" />
          <path d="M120 8 l4 10 l10 2 l-8 7 l3 11 l-9 -6 l-9 6 l3 -11 l-8 -7 l10 -2z" fill="#FCD34D" />
        </g>
      );
    case 'bow':
      return (
        <g transform="translate(120 44)">
          <path d="M0 0 L-26 -12 L-26 12 z" fill="#F472B6" />
          <path d="M0 0 L26 -12 L26 12 z" fill="#F472B6" />
          <circle cx="0" cy="0" r="7" fill="#DB2777" />
        </g>
      );
    default:
      return null;
  }
}

/* ---------- acessório (rosto / pescoço) ---------- */
function Accessory({ accessory, pose }: { accessory: string; pose: 'bust' | 'sit' }) {
  const neckY = pose === 'bust' ? 168 : 156;
  switch (accessory) {
    case 'glasses':
      return (
        <g stroke="#1F2937" strokeWidth="4" fill="none">
          <circle cx="96" cy="102" r="15" fill="#FFFFFF" fillOpacity="0.25" />
          <circle cx="144" cy="102" r="15" fill="#FFFFFF" fillOpacity="0.25" />
          <line x1="111" y1="102" x2="129" y2="102" />
        </g>
      );
    case 'sunglasses':
      return (
        <g>
          <rect x="80" y="92" width="32" height="22" rx="7" fill="#111827" />
          <rect x="128" y="92" width="32" height="22" rx="7" fill="#111827" />
          <line x1="112" y1="100" x2="128" y2="100" stroke="#111827" strokeWidth="4" />
          <line x1="84" y1="96" x2="104" y2="100" stroke="#475569" strokeWidth="2" />
        </g>
      );
    case 'bowtie':
      return (
        <g transform={`translate(120 ${neckY + 16})`}>
          <path d="M0 0 L-20 -10 L-20 10 z" fill="#EF4444" />
          <path d="M0 0 L20 -10 L20 10 z" fill="#EF4444" />
          <rect x="-5" y="-7" width="10" height="14" rx="2" fill="#B91C1C" />
        </g>
      );
    case 'scarf':
      return (
        <g>
          <path d={`M70 ${neckY} q50 28 100 0 q4 18 -50 22 q-54 -4 -50 -22z`} fill="#DC2626" />
          <rect x="108" y={neckY + 18} width="20" height="34" rx="5" fill="#B91C1C" />
        </g>
      );
    case 'earbuds':
      return (
        <g fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5">
          <rect x="64" y="108" width="9" height="20" rx="4" />
          <rect x="167" y="108" width="9" height="20" rx="4" />
        </g>
      );
    case 'necklace':
      return (
        <g>
          <path d={`M90 ${neckY + 4} q30 26 60 0`} stroke="#FBBF24" strokeWidth="3.5" fill="none" />
          <circle cx="120" cy={neckY + 22} r="6" fill="#F472B6" stroke="#FBBF24" strokeWidth="2" />
        </g>
      );
    default:
      return null;
  }
}

interface Props {
  animal: string;
  outfit?: Partial<Outfit>;
  pose?: 'bust' | 'sit';
  size?: number;
  className?: string;
  /** desenha o círculo de fundo colorido (foto de perfil) */
  framed?: boolean;
}

export function CharacterAvatar({ animal, outfit, pose = 'bust', size = 96, className = '', framed = true }: Props) {
  const p = PALETTES[animal] ?? PALETTES.lion;
  const hat = outfit?.hat ?? 'none';
  const top = outfit?.top ?? 'none';
  const accessory = outfit?.accessory ?? 'none';
  const bgKey = outfit?.bg ?? 'mint';
  const grad = BG_GRAD[bgKey] ?? BG_GRAD.mint;
  const uid = `${animal}-${bgKey}-${pose}`;
  const showFrame = framed && pose === 'bust';

  return (
    <svg
      viewBox="0 0 240 248"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`avatar ${animal}`}
    >
      <defs>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor={grad[0]} />
          <stop offset="100%" stopColor={grad[1]} />
        </radialGradient>
        <clipPath id={`clip-${uid}`}>
          <circle cx="120" cy="124" r="120" />
        </clipPath>
      </defs>

      <g clipPath={showFrame ? `url(#clip-${uid})` : undefined}>
        {showFrame && <rect x="0" y="0" width="240" height="248" fill={`url(#bg-${uid})`} />}

        {/* corpo + roupa */}
        <Body pose={pose} color={top === 'none' ? p.fur : p.furDark} />
        <TopClothes top={top} pose={pose} />

        {/* cabeça */}
        <Ears animal={animal} p={p} />
        {animal === 'lion' && <FaceExtras animal={animal} p={p} />}
        <ellipse cx="120" cy="100" rx="66" ry="62" fill={p.fur} />
        {animal !== 'lion' && <FaceExtras animal={animal} p={p} />}
        <Face animal={animal} p={p} />

        {/* acessórios + chapéu por cima */}
        <Accessory accessory={accessory} pose={pose} />
        <Hat hat={hat} />
      </g>
    </svg>
  );
}
