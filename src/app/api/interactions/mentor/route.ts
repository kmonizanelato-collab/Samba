import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calcFreqAnual } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = parseInt(session.user.id);
  const [grades, attendance] = await Promise.all([
    prisma.grade.findMany({ where: { userId } }),
    prisma.studentAttendance.findFirst({ where: { userId, year: 2026 } }),
  ]);

  // média por disciplina
  const bySubject: Record<string, number[]> = {};
  let totalFaltas = 0;
  for (const g of grades) {
    totalFaltas += g.faltas;
    if (g.nota !== null) (bySubject[g.subject] ??= []).push(g.nota);
  }

  const subjects = Object.entries(bySubject).map(([subject, notas]) => ({
    subject,
    average: notas.reduce((s, n) => s + n, 0) / notas.length,
    count: notas.length,
  }));

  const allNotas = subjects.flatMap((s) => bySubject[s.subject]);
  const overall = allNotas.length ? allNotas.reduce((a, b) => a + b, 0) / allNotas.length : null;

  const sorted = [...subjects].sort((a, b) => b.average - a.average);
  const strongest = sorted[0] ?? null;
  const weakest = sorted[sorted.length - 1] ?? null;
  const attention = subjects.filter((s) => s.average < 5).sort((a, b) => a.average - b.average);

  const freqAnual = calcFreqAnual(attendance?.diasFaltados ?? 0);

  // Recomendações (regras)
  const tips: string[] = [];
  if (!grades.length) {
    tips.push('Seu boletim ainda está sem notas. Assim que o professor lançar, eu trago uma análise completa pra você. 😉');
  } else {
    if (attention.length) {
      tips.push(`Foque atenção em **${attention.map((s) => s.subject).join(', ')}** — são as matérias abaixo da média 5. Que tal montar um grupo de estudos sobre elas?`);
    } else {
      tips.push('Mandou bem! Nenhuma matéria está abaixo da média. Continue assim. 🚀');
    }
    if (strongest) tips.push(`Seu ponto forte é **${strongest.subject}** (média ${strongest.average.toFixed(1)}). Use isso pra ajudar os amigos e ganhar pontos no ranking!`);
    if (overall !== null) {
      if (overall >= 7) tips.push(`Sua média geral é **${overall.toFixed(1)}** — excelente! Você está no caminho da aprovação tranquila.`);
      else if (overall >= 5) tips.push(`Sua média geral é **${overall.toFixed(1)}**. Com um empurrãozinho nas matérias mais difíceis você sobe rápido.`);
      else tips.push(`Sua média geral é **${overall.toFixed(1)}**. Bora traçar um plano: 30 minutos por dia na matéria mais difícil já faz diferença.`);
    }
    if (freqAnual < 75) tips.push(`⚠️ Atenção à frequência: você está em **${freqAnual}%** (abaixo de 75% reprova). Não falte!`);
    else if (freqAnual < 90) tips.push(`Sua frequência está em **${freqAnual}%**. Tente faltar menos para ficar na zona verde (90%+).`);
  }

  return NextResponse.json({
    name: session.user.name,
    overall,
    freqAnual,
    totalFaltas,
    strongest,
    weakest,
    attention,
    subjects: sorted,
    tips,
  });
}
