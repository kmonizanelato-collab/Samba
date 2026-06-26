import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateBR(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function calcFrequencia(faltas: number, aulasMinistradas: number): number {
  if (aulasMinistradas === 0) return 100;
  return Math.round(((aulasMinistradas - faltas) / aulasMinistradas) * 100);
}

export function calcFreqAnual(diasFaltados: number): number {
  const totalAulas = 1800; // 200 dias × 9 aulas
  const faltasAulas = diasFaltados * 9;
  return Math.round(((totalAulas - faltasAulas) / totalAulas) * 100);
}

export function calcFreqBimestre(diasFaltados: number, diasPrevistos: number): number {
  if (diasPrevistos === 0) return 100;
  return Math.round(((diasPrevistos - diasFaltados) / diasPrevistos) * 100);
}

export const FREQ_MINIMA = 75;
export const FREQ_EXCELENCIA = 80;

export function getFreqColor(freq: number): string {
  if (freq >= 90) return 'text-green-600 dark:text-green-400';
  if (freq >= 75) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function getGradeColor(nota: number | null | undefined): string {
  if (nota === null || nota === undefined) return '';
  return nota >= 5 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400';
}

export function getCFColor(cf: number | null): string {
  if (cf === null) return '';
  return cf >= 20 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400';
}

export function getMetaColor(meta: number | null, nota: number | null): string {
  if (meta === null || nota === null) return 'text-gray-500';
  return nota >= meta ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
}

export const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const DAY_NAMES_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
