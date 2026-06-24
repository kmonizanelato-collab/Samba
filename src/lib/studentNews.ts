import { StudentNews } from '@prisma/client';

export type NewsStatus = 'aberta' | 'em_breve' | 'encerrada' | null;

export function getStudentYear(grade: string | null | undefined): number | null {
  if (!grade) return null;
  const year = parseInt(grade[0], 10);
  return Number.isNaN(year) ? null : year;
}

export function isRelevantNews(news: Pick<StudentNews, 'targetYears'>, studentYear: number | null): boolean {
  if (news.targetYears.length === 0) return true;
  if (studentYear === null) return false;
  return news.targetYears.includes(studentYear);
}

export function getNewsStatus(news: Pick<StudentNews, 'opensAt' | 'closesAt'>, now: Date): NewsStatus {
  if (!news.opensAt && !news.closesAt) return null;
  if (news.opensAt && now < news.opensAt) return 'em_breve';
  if (news.closesAt && now > news.closesAt) return 'encerrada';
  return 'aberta';
}
