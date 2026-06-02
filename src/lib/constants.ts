export interface TimeSlot {
  start: string;
  end: string;
  label: string;
  isBreak?: boolean;
  isLunch?: boolean;
}

export const MEDIO_WEEKDAY_SLOTS: TimeSlot[] = [
  { start: '07:00', end: '07:50', label: '1ª Aula' },
  { start: '07:50', end: '08:40', label: '2ª Aula' },
  { start: '08:40', end: '09:30', label: '3ª Aula' },
  { start: '09:30', end: '09:45', label: 'Intervalo', isBreak: true },
  { start: '09:45', end: '10:35', label: '4ª Aula' },
  { start: '10:35', end: '11:25', label: '5ª Aula' },
  { start: '11:25', end: '12:15', label: '6ª Aula' },
  { start: '12:15', end: '13:15', label: 'Almoço', isLunch: true },
  { start: '13:15', end: '14:05', label: '7ª Aula' },
  { start: '14:05', end: '14:20', label: 'Intervalo', isBreak: true },
  { start: '14:20', end: '15:10', label: '8ª Aula' },
  { start: '15:10', end: '16:00', label: '9ª Aula' },
];

export const FUNDAMENTAL_WEEKDAY_SLOTS: TimeSlot[] = [
  { start: '07:00', end: '07:50', label: '1ª Aula' },
  { start: '07:50', end: '08:40', label: '2ª Aula' },
  { start: '08:40', end: '09:30', label: '3ª Aula' },
  { start: '09:30', end: '09:45', label: 'Intervalo', isBreak: true },
  { start: '09:45', end: '10:35', label: '4ª Aula' },
  { start: '10:35', end: '11:25', label: '5ª Aula' },
  { start: '11:25', end: '12:25', label: 'Almoço', isLunch: true },
  { start: '12:25', end: '13:15', label: '6ª Aula' },
  { start: '13:15', end: '14:05', label: '7ª Aula' },
  { start: '14:05', end: '14:20', label: 'Intervalo', isBreak: true },
  { start: '14:20', end: '15:10', label: '8ª Aula' },
  { start: '15:10', end: '16:00', label: '9ª Aula' },
];

function generateAfternoonSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 16; h <= 23; h++) {
    for (const m of [0, 30]) {
      if (h === 23 && m === 30) continue;
      const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const endM = m + 30;
      const endH = endM >= 60 ? h + 1 : h;
      const end = `${String(endH).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;
      slots.push({ start, end, label: start });
    }
  }
  return slots;
}

export const AFTERNOON_SLOTS: TimeSlot[] = generateAfternoonSlots();

function generateWeekendSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let h = 7; h <= 22; h++) {
    const start = `${String(h).padStart(2, '0')}:00`;
    const end = `${String(h + 1).padStart(2, '0')}:00`;
    slots.push({ start, end, label: start });
  }
  return slots;
}

export const WEEKEND_SLOTS: TimeSlot[] = generateWeekendSlots();

export function getWeekdaySlots(level: string | null | undefined): TimeSlot[] {
  const base = level === 'FUNDAMENTAL' ? FUNDAMENTAL_WEEKDAY_SLOTS : MEDIO_WEEKDAY_SLOTS;
  return [...base, ...AFTERNOON_SLOTS];
}

export const SUGGESTED_ACTIVITIES = [
  'Ensino médio regular',
  'Ensino médio integral',
  'Ensino médio técnico',
  'Curso técnico profissionalizante',
  'Cursinho pré-vestibular gratuito',
  'Cursinho pré-vestibular pago',
  'Aulas particulares presenciais',
  'Aulas particulares online',
  'Monitoria escolar',
  'Reforço escolar',
  'Curso de idiomas (inglês, espanhol etc.)',
  'Curso de informática',
  'Curso de programação',
  'Curso de design gráfico',
  'Curso de robótica',
  'Curso preparatório para o ENEM',
  'Curso preparatório para vestibulares',
  'Plataforma de estudos online (videoaulas)',
  'Curso EAD (ensino a distância)',
  'Grupo de estudos com colegas',
  'Olimpíadas acadêmicas (matemática, história, física etc.)',
  'Iniciação científica júnior',
  'Projeto de pesquisa escolar',
  'Intercâmbio estudantil',
  'Curso de educação financeira',
  'Curso de empreendedorismo',
  'Curso de redação',
  'Curso de oratória/comunicação',
  'Participação em feiras científicas',
  'Programa Jovem Aprendiz com formação teórica',
];

export const ACTIVITY_COLORS = [
  { label: 'Azul', value: '#2563eb' },
  { label: 'Roxo', value: '#7c3aed' },
  { label: 'Verde', value: '#16a34a' },
  { label: 'Laranja', value: '#ea580c' },
  { label: 'Rosa', value: '#db2777' },
  { label: 'Cinza', value: '#4b5563' },
];

export const MEDIO_SUBJECTS = [
  'Língua Portuguesa',
  'Educação Física',
  'Geografia',
  'História',
  'Sociologia',
  'Biologia',
  'Física',
  'Matemática',
  'Química',
  'Projeto de Vida',
  'Língua Inglesa',
  'Empreendedorismo',
  'Educação Financeira',
  'Redação e Leitura',
  'Práticas Experimentais',
  'Programação',
  'Robótica',
  'Orientação de Estudo - Matemática',
];

export const FUNDAMENTAL_SUBJECTS = [
  'Língua Portuguesa',
  'Matemática',
  'Ciências',
  'História',
  'Geografia',
  'Arte',
  'Educação Física',
  'Língua Inglesa',
  'Ensino Religioso',
];

export function getSubjects(level: string | null | undefined): string[] {
  return level === 'FUNDAMENTAL' ? FUNDAMENTAL_SUBJECTS : MEDIO_SUBJECTS;
}

export const GRADES_LIST = ['2A', '2B', '2C', '9A', '9B', '9C'];
export const MEDIO_GRADES = ['2A', '2B', '2C'];
export const FUNDAMENTAL_GRADES = ['9A', '9B', '9C'];

// Todas as salas da escola (mesmo sem alunos cadastrados).
// Fundamental: 6º ao 9º ano · Médio: 1ª à 3ª série · turmas A, B e C.
const SECTIONS = ['A', 'B', 'C'];

export const FUNDAMENTAL_ROOMS: string[] = ['6', '7', '8', '9'].flatMap((y) =>
  SECTIONS.map((s) => `${y}${s}`)
);

export const MEDIO_ROOMS: string[] = ['1', '2', '3'].flatMap((y) =>
  SECTIONS.map((s) => `${y}${s}`)
);

export const ALL_ROOMS: string[] = [...FUNDAMENTAL_ROOMS, ...MEDIO_ROOMS];

export function roomLevel(grade: string): 'FUNDAMENTAL' | 'MEDIO' {
  return FUNDAMENTAL_ROOMS.includes(grade) ? 'FUNDAMENTAL' : 'MEDIO';
}

export function roomLabel(grade: string): string {
  const year = grade.slice(0, -1);
  const section = grade.slice(-1);
  return roomLevel(grade) === 'FUNDAMENTAL'
    ? `${year}º ano ${section}`
    : `${year}ª série ${section}`;
}
