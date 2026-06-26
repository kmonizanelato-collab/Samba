export interface AnimalDef {
  key: string;
  label: string;
  habitat: string;
}

export const JUNGLE_ANIMALS: AnimalDef[] = [
  { key: 'lion', label: 'Leão', habitat: 'Rei da clareira' },
  { key: 'tiger', label: 'Tigre', habitat: 'Caçador silencioso' },
  { key: 'monkey', label: 'Macaco', habitat: 'Mestre das árvores' },
  { key: 'elephant', label: 'Elefante', habitat: 'Guardião da trilha' },
  { key: 'giraffe', label: 'Girafa', habitat: 'Vigia do horizonte' },
  { key: 'zebra', label: 'Zebra', habitat: 'Veloz da savana' },
  { key: 'panda', label: 'Panda', habitat: 'Sábio do bambuzal' },
  { key: 'parrot', label: 'Papagaio', habitat: 'Mensageiro da copa' },
];

export const JUNGLE_ANIMAL_KEYS = JUNGLE_ANIMALS.map((a) => a.key);

export function isValidAnimal(key: string): boolean {
  return JUNGLE_ANIMAL_KEYS.includes(key);
}

/* ===========================================================
   Customização do avatar (boneco vestível)
   =========================================================== */

export interface OutfitOption {
  key: string;
  label: string;
  /** cor de amostra para o seletor (quando faz sentido) */
  swatch?: string;
}

export interface Outfit {
  hat: string;
  top: string;
  accessory: string;
  bg: string;
}

export const DEFAULT_OUTFIT: Outfit = { hat: 'none', top: 'none', accessory: 'none', bg: 'mint' };

export const HATS: OutfitOption[] = [
  { key: 'none', label: 'Sem chapéu' },
  { key: 'cap', label: 'Boné' },
  { key: 'beanie', label: 'Gorro' },
  { key: 'party', label: 'Festa' },
  { key: 'graduation', label: 'Formatura' },
  { key: 'crown', label: 'Coroa' },
  { key: 'flower', label: 'Florzinha' },
  { key: 'headphones', label: 'Fones' },
  { key: 'wizard', label: 'Mago' },
  { key: 'bow', label: 'Lacinho' },
];

export const TOPS: OutfitOption[] = [
  { key: 'none', label: 'Sem roupa' },
  { key: 'tshirt', label: 'Camiseta' },
  { key: 'hoodie', label: 'Moletom' },
  { key: 'striped', label: 'Listrada' },
  { key: 'jersey', label: 'Camisa de time' },
  { key: 'dress', label: 'Vestido' },
  { key: 'jacket', label: 'Jaqueta' },
  { key: 'sweater', label: 'Suéter' },
];

export const ACCESSORIES: OutfitOption[] = [
  { key: 'none', label: 'Nenhum' },
  { key: 'glasses', label: 'Óculos' },
  { key: 'sunglasses', label: 'Óculos de sol' },
  { key: 'bowtie', label: 'Gravata-borboleta' },
  { key: 'scarf', label: 'Cachecol' },
  { key: 'earbuds', label: 'Fone sem fio' },
  { key: 'necklace', label: 'Colar' },
];

export const BG_OPTIONS: OutfitOption[] = [
  { key: 'mint', label: 'Menta', swatch: '#6EE7B7' },
  { key: 'sky', label: 'Céu', swatch: '#7DD3FC' },
  { key: 'peach', label: 'Pêssego', swatch: '#FDBA74' },
  { key: 'rose', label: 'Rosa', swatch: '#FDA4AF' },
  { key: 'violet', label: 'Lilás', swatch: '#C4B5FD' },
  { key: 'sun', label: 'Sol', swatch: '#FCD34D' },
  { key: 'slate', label: 'Grafite', swatch: '#94A3B8' },
  { key: 'forest', label: 'Floresta', swatch: '#34D399' },
];

const HAT_KEYS = new Set(HATS.map((o) => o.key));
const TOP_KEYS = new Set(TOPS.map((o) => o.key));
const ACC_KEYS = new Set(ACCESSORIES.map((o) => o.key));
const BG_KEYS = new Set(BG_OPTIONS.map((o) => o.key));

/** Garante um outfit válido a partir de dados crus (DB/entrada). */
export function normalizeOutfit(raw: Partial<Outfit> | null | undefined): Outfit {
  return {
    hat: raw?.hat && HAT_KEYS.has(raw.hat) ? raw.hat : 'none',
    top: raw?.top && TOP_KEYS.has(raw.top) ? raw.top : 'none',
    accessory: raw?.accessory && ACC_KEYS.has(raw.accessory) ? raw.accessory : 'none',
    bg: raw?.bg && BG_KEYS.has(raw.bg) ? raw.bg : 'mint',
  };
}

/** select do Prisma para puxar avatar + roupas do perfil. */
export const PROFILE_AVATAR_SELECT = {
  avatar: true,
  hat: true,
  top: true,
  accessory: true,
  bg: true,
} as const;

export interface RawProfile {
  avatar: string;
  hat: string;
  top: string;
  accessory: string;
  bg: string;
}

/** extrai { avatar, outfit } de um perfil do banco (ou nulo). */
export function profileOutfit(p: RawProfile | null | undefined): { avatar: string | null; outfit: Outfit | null } {
  return {
    avatar: p?.avatar ?? null,
    outfit: p ? { hat: p.hat, top: p.top, accessory: p.accessory, bg: p.bg } : null,
  };
}
