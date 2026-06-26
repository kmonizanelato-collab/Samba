/* Cena ilustrada do chalé aconchegante (vetor, combina com o boneco).
   O avatar sentado é sobreposto por cima da poltrona em InteractionsHome. */
export function ChaletScene() {
  return (
    <svg viewBox="0 0 800 520" className="w-full h-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Interior do chalé">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a4a2b" />
          <stop offset="100%" stopColor="#5e3720" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9a6233" />
          <stop offset="100%" stopColor="#7a4a25" />
        </linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd29b" />
          <stop offset="45%" stopColor="#ff9e7a" />
          <stop offset="100%" stopColor="#6b6fae" />
        </linearGradient>
        <radialGradient id="fire" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#fff0b3" />
          <stop offset="45%" stopColor="#ff8a2b" />
          <stop offset="100%" stopColor="#d63d11" />
        </radialGradient>
        <radialGradient id="firehalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb25e" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffb25e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="roomlight" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffdca8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffdca8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* parede e piso */}
      <rect x="0" y="0" width="800" height="380" fill="url(#wall)" />
      <rect x="0" y="380" width="800" height="140" fill="url(#floor)" />
      {[60, 130, 200, 270, 340].map((y) => (
        <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#000" strokeOpacity="0.07" strokeWidth="3" />
      ))}
      {[120, 300, 480, 660].map((x) => (
        <line key={x} x1={x} y1="380" x2={x - 30} y2="520" stroke="#000" strokeOpacity="0.08" strokeWidth="3" />
      ))}
      <rect x="0" y="0" width="800" height="520" fill="url(#roomlight)" />

      {/* janela com vista da floresta ao entardecer */}
      <g>
        <rect x="60" y="70" width="220" height="220" rx="14" fill="#3a2415" />
        <rect x="72" y="82" width="196" height="196" rx="8" fill="url(#sky)" />
        {/* sol */}
        <circle cx="170" cy="150" r="26" fill="#fff3c4" opacity="0.9" />
        {/* montanhas */}
        <path d="M72 220 L120 160 L165 220 Z" fill="#5b5f96" opacity="0.85" />
        <path d="M150 230 L205 165 L268 230 Z" fill="#6a6fa6" opacity="0.85" />
        {/* pinheiros */}
        {[90, 130, 175, 220, 250].map((x, i) => (
          <g key={i} transform={`translate(${x} ${250 - (i % 2) * 6})`}>
            <path d="M0 0 L-12 26 L12 26 Z" fill="#2f6b43" />
            <path d="M0 -12 L-10 14 L10 14 Z" fill="#357a4c" />
          </g>
        ))}
        <rect x="72" y="246" width="196" height="32" fill="#2f6b43" opacity="0.6" />
        {/* caixilhos */}
        <line x1="170" y1="82" x2="170" y2="278" stroke="#3a2415" strokeWidth="8" />
        <line x1="72" y1="180" x2="268" y2="180" stroke="#3a2415" strokeWidth="8" />
        {/* cortina */}
        <path d="M56 64 q18 110 -2 230 q22 -8 30 -22 q-8 -100 4 -208 z" fill="#b23b3b" />
        <path d="M284 64 q-18 110 2 230 q-22 -8 -30 -22 q8 -100 -4 -208 z" fill="#b23b3b" />
        <rect x="48" y="58" width="244" height="14" rx="7" fill="#8a2d2d" />
      </g>

      {/* luzinhas penduradas */}
      <path d="M300 40 Q500 90 760 36" stroke="#caa46a" strokeWidth="3" fill="none" />
      {Array.from({ length: 10 }).map((_, i) => {
        const t = i / 9;
        const x = 300 + t * 460;
        const y = 40 + Math.sin(t * Math.PI) * 48 + 6;
        const colors = ['#ffd76b', '#ff9e7a', '#9be3a2', '#8ec5ff'];
        return <circle key={i} cx={x} cy={y} r="6" fill={colors[i % colors.length]} className="chalet-bulb" style={{ animationDelay: `${i * 0.2}s` }} />;
      })}

      {/* prateleira com livros e plantinha */}
      <rect x="330" y="150" width="150" height="12" rx="3" fill="#4a2d1a" />
      <rect x="338" y="118" width="12" height="32" fill="#c0573f" />
      <rect x="352" y="112" width="12" height="38" fill="#3f7d8c" />
      <rect x="366" y="120" width="12" height="30" fill="#caa14a" />
      <rect x="380" y="116" width="12" height="34" fill="#6b8f5a" />
      <g transform="translate(450 150)">
        <path d="M-10 0 h20 l-3 -22 h-14 z" fill="#b6764a" />
        <path d="M0 -22 q-16 -10 -18 -30 q14 2 18 22 q4 -22 18 -26 q0 24 -18 34z" fill="#4f9e63" />
      </g>

      {/* lareira à direita */}
      <g>
        <ellipse cx="650" cy="330" rx="170" ry="120" fill="url(#firehalo)" />
        <rect x="560" y="200" width="200" height="190" rx="8" fill="#8a8f96" />
        <rect x="560" y="200" width="200" height="190" rx="8" fill="#000" opacity="0.04" />
        {/* tijolos */}
        {[0, 1, 2, 3].map((r) => (
          <line key={r} x1="560" y1={200 + r * 44} x2="760" y2={200 + r * 44} stroke="#000" strokeOpacity="0.12" strokeWidth="3" />
        ))}
        <rect x="548" y="186" width="224" height="20" rx="5" fill="#6f7479" />
        {/* abertura */}
        <rect x="600" y="250" width="120" height="120" rx="8" fill="#2a1a12" />
        {/* lenha */}
        <rect x="612" y="346" width="96" height="14" rx="6" fill="#6b4326" />
        <rect x="624" y="334" width="72" height="14" rx="6" fill="#7c4f2e" />
        {/* fogo */}
        <g className="chalet-fire">
          <path d="M660 360 q-30 -28 -10 -64 q6 18 16 22 q-6 -30 14 -50 q-4 30 14 42 q12 12 8 34 q-6 24 -52 16z" fill="url(#fire)" />
          <path d="M660 358 q-16 -16 -6 -38 q6 12 12 14 q-2 -18 8 -28 q0 18 10 26 q6 10 2 22 q-8 14 -36 2z" fill="#ffe08a" opacity="0.9" />
        </g>
      </g>

      {/* quadro na parede */}
      <g transform="translate(500 90)">
        <rect x="-2" y="-2" width="74" height="58" rx="4" fill="#b08d57" />
        <rect x="0" y="0" width="70" height="54" rx="3" fill="#caa46a" />
        <rect x="6" y="6" width="58" height="42" rx="2" fill="#7fb6d6" />
        <path d="M6 48 L26 28 L40 40 L52 24 L64 40 L64 48 Z" fill="#3f7d52" />
        <circle cx="20" cy="18" r="6" fill="#fff3c4" />
      </g>

      {/* tapete */}
      <ellipse cx="400" cy="452" rx="250" ry="48" fill="#7a3434" />
      <ellipse cx="400" cy="452" rx="250" ry="48" fill="none" stroke="#e0b07a" strokeWidth="4" strokeOpacity="0.5" />
      <ellipse cx="400" cy="452" rx="180" ry="32" fill="#8c4040" />

      {/* poltrona (encosto + assento atrás do avatar) */}
      <g>
        <ellipse cx="400" cy="470" rx="150" ry="30" fill="#000" opacity="0.18" />
        {/* encosto */}
        <path d="M286 470 Q280 300 400 300 Q520 300 514 470 Z" fill="#3f8a78" />
        <path d="M300 470 Q296 322 400 322 Q504 322 500 470 Z" fill="#4aa08b" />
        {/* almofada do encosto */}
        <ellipse cx="400" cy="392" rx="86" ry="64" fill="#57b39c" />
        <ellipse cx="400" cy="392" rx="86" ry="64" fill="none" stroke="#3f8a78" strokeWidth="3" />
      </g>

      {/* mesinha lateral com caneca (frente esquerda) */}
      <g transform="translate(150 410)">
        <rect x="0" y="20" width="70" height="60" rx="6" fill="#6b4326" />
        <rect x="0" y="14" width="70" height="14" rx="6" fill="#7c4f2e" />
        <ellipse cx="35" cy="14" rx="6" ry="3" fill="#000" opacity="0.1" />
        <rect x="22" y="-2" width="26" height="18" rx="4" fill="#e8e3d8" />
        <path d="M48 2 q12 2 0 12" stroke="#e8e3d8" strokeWidth="4" fill="none" />
        <path d="M30 -2 q4 -8 10 0" stroke="#fff" strokeWidth="2" fill="none" opacity="0.6" />
      </g>
    </svg>
  );
}

/* Peça em primeiro plano: braços + frente da poltrona (vai por cima do avatar). */
export function ChaletChairFront() {
  return (
    <svg viewBox="0 0 800 520" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {/* assento à frente */}
      <path d="M300 452 Q400 432 500 452 L508 484 Q400 470 292 484 Z" fill="#4aa08b" />
      <path d="M300 452 Q400 432 500 452" stroke="#3f8a78" strokeWidth="3" fill="none" />
      {/* braços */}
      <g fill="#3f8a78">
        <path d="M276 392 q-20 0 -22 40 l4 56 q30 8 44 0 l0 -70 q-8 -26 -26 -26z" />
        <path d="M524 392 q20 0 22 40 l-4 56 q-30 8 -44 0 l0 -70 q8 -26 26 -26z" />
      </g>
      <g fill="#57b39c">
        <ellipse cx="270" cy="412" rx="22" ry="18" />
        <ellipse cx="530" cy="412" rx="22" ry="18" />
      </g>
      {/* pés */}
      <rect x="300" y="486" width="20" height="22" rx="6" fill="#34302c" />
      <rect x="480" y="486" width="20" height="22" rx="6" fill="#34302c" />
    </svg>
  );
}
