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
