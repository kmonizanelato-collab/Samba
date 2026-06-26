export interface AnimalDef {
  key: string;
  label: string;
}

export const ANIMALS: AnimalDef[] = [
  { key: 'lion', label: 'Leão' },
  { key: 'tiger', label: 'Tigre' },
  { key: 'fox', label: 'Raposa' },
  { key: 'dog', label: 'Cachorro' },
  { key: 'cat', label: 'Gato' },
  { key: 'rabbit', label: 'Coelho' },
  { key: 'bear', label: 'Urso' },
  { key: 'panda', label: 'Panda' },
  { key: 'koala', label: 'Coala' },
  { key: 'monkey', label: 'Macaco' },
  { key: 'pig', label: 'Porco' },
  { key: 'cow', label: 'Vaca' },
  { key: 'horse', label: 'Cavalo' },
  { key: 'zebra', label: 'Zebra' },
  { key: 'giraffe', label: 'Girafa' },
  { key: 'elephant', label: 'Elefante' },
  { key: 'frog', label: 'Sapo' },
  { key: 'hamster', label: 'Hamster' },
  { key: 'chick', label: 'Pintinho' },
  { key: 'owl', label: 'Coruja' },
  { key: 'penguin', label: 'Pinguim' },
  { key: 'parrot', label: 'Papagaio' },
  { key: 'unicorn', label: 'Unicórnio' },
];

// Compat: alguns lugares antigos usavam JUNGLE_ANIMALS
export const JUNGLE_ANIMALS = ANIMALS;
export const ANIMAL_KEYS = ANIMALS.map((a) => a.key);
export function isValidAnimal(key: string): boolean {
  return ANIMAL_KEYS.includes(key);
}

export interface Cosmetic {
  key: string;
  label: string;
}

export const HATS: Cosmetic[] = [
  { key: 'none', label: 'Nenhum' },
  { key: 'cap', label: 'Boné' },
  { key: 'tophat', label: 'Cartola' },
  { key: 'crown', label: 'Coroa' },
  { key: 'grad', label: 'Formatura' },
  { key: 'sunhat', label: 'Chapéu' },
  { key: 'helmet', label: 'Capacete' },
  { key: 'military', label: 'Militar' },
  { key: 'bow', label: 'Laço' },
];

export const GLASSES: Cosmetic[] = [
  { key: 'none', label: 'Nenhum' },
  { key: 'glasses', label: 'Óculos' },
  { key: 'sunglasses', label: 'Óculos de sol' },
  { key: 'goggles', label: 'Óculos de proteção' },
];

export interface BgOption {
  key: string;
  label: string;
  color: string;
}

export const BGS: BgOption[] = [
  { key: 'sky', label: 'Céu', color: '#7DD3FC' },
  { key: 'mint', label: 'Menta', color: '#5EEAD4' },
  { key: 'blue', label: 'Azul', color: '#93C5FD' },
  { key: 'violet', label: 'Lilás', color: '#C4B5FD' },
  { key: 'pink', label: 'Rosa', color: '#F9A8D4' },
  { key: 'rose', label: 'Coral', color: '#FDA4AF' },
  { key: 'peach', label: 'Pêssego', color: '#FDBA74' },
  { key: 'sun', label: 'Sol', color: '#FDE047' },
  { key: 'lime', label: 'Limão', color: '#BEF264' },
  { key: 'slate', label: 'Cinza', color: '#CBD5E1' },
];

const HAT_KEYS = new Set(HATS.map((h) => h.key));
const GLASSES_KEYS = new Set(GLASSES.map((g) => g.key));
const BG_KEYS = new Set(BGS.map((b) => b.key));

export interface AvatarLook {
  animal: string;
  hat: string;
  accessory: string;
  bg: string;
}

export const DEFAULT_LOOK: AvatarLook = { animal: 'lion', hat: 'none', accessory: 'none', bg: 'sky' };

export function normalizeLook(raw: Partial<AvatarLook> | null | undefined): AvatarLook {
  return {
    animal: raw?.animal && isValidAnimal(raw.animal) ? raw.animal : 'lion',
    hat: raw?.hat && HAT_KEYS.has(raw.hat) ? raw.hat : 'none',
    accessory: raw?.accessory && GLASSES_KEYS.has(raw.accessory) ? raw.accessory : 'none',
    bg: raw?.bg && BG_KEYS.has(raw.bg) ? raw.bg : 'sky',
  };
}

export function bgColor(key: string | null | undefined): string {
  return BGS.find((b) => b.key === key)?.color ?? '#7DD3FC';
}

/** select do Prisma para puxar o visual do perfil. */
export const AVATAR_SELECT = { avatar: true, hat: true, accessory: true, bg: true } as const;

export interface RawProfile {
  avatar: string;
  hat: string;
  accessory: string;
  bg: string;
}

/** Extrai o visual de um perfil do banco (ou um padrão). */
export function lookOf(p: RawProfile | null | undefined): AvatarLook {
  if (!p) return { ...DEFAULT_LOOK };
  return { animal: p.avatar, hat: p.hat, accessory: p.accessory, bg: p.bg };
}
