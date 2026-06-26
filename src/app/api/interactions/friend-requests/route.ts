import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { roomLabel } from '@/lib/constants';
import { AVATAR_SELECT, lookOf, RawProfile } from '@/lib/interactions';

export const dynamic = 'force-dynamic';

const userSelect = { id: true, name: true, grade: true, interactionsProfile: { select: AVATAR_SELECT } } as const;

function serialize(u: { id: number; name: string; grade: string | null; interactionsProfile: RawProfile | null }) {
  const look = lookOf(u.interactionsProfile);
  return {
    id: u.id,
    name: u.name,
    grade: u.grade,
    gradeLabel: u.grade ? roomLabel(u.grade) : null,
    avatar: u.interactionsProfile ? look.animal : null,
    hat: look.hat,
    accessory: look.accessory,
    bg: look.bg,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = parseInt(session.user.id);
  const [received, sent] = await Promise.all([
    prisma.friendRequest.findMany({ where: { toUserId: userId, status: 'PENDING' }, include: { fromUser: { select: userSelect } }, orderBy: { createdAt: 'desc' } }),
    prisma.friendRequest.findMany({ where: { fromUserId: userId, status: 'PENDING' }, include: { toUser: { select: userSelect } }, orderBy: { createdAt: 'desc' } }),
  ]);

  return NextResponse.json({
    received: received.map((r) => ({ id: r.id, createdAt: r.createdAt, user: serialize(r.fromUser) })),
    sent: sent.map((r) => ({ id: r.id, createdAt: r.createdAt, user: serialize(r.toUser) })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = parseInt(session.user.id);
  const myGrade = session.user.grade ?? null;
  const body = await req.json();
  const toUserId = parseInt(body.toUserId);
  if (!toUserId) return NextResponse.json({ error: 'Aluno inválido.' }, { status: 400 });
  if (toUserId === userId) return NextResponse.json({ error: 'Você não pode adicionar a si mesmo.' }, { status: 400 });

  const target = await prisma.user.findFirst({ where: { id: toUserId, role: 'STUDENT' } });
  if (!target) return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 });
  // Apenas colegas da MESMA SALA
  if (!myGrade || target.grade !== myGrade) {
    return NextResponse.json({ error: 'Você só pode adicionar colegas da sua sala.' }, { status: 403 });
  }

  const existing = await prisma.friendRequest.findFirst({
    where: { OR: [{ fromUserId: userId, toUserId: target.id }, { fromUserId: target.id, toUserId: userId }] },
  });
  if (existing) {
    if (existing.status === 'ACCEPTED') return NextResponse.json({ error: 'Vocês já são amigos.' }, { status: 409 });
    if (existing.status === 'PENDING') return NextResponse.json({ error: 'Já existe um pedido pendente.' }, { status: 409 });
    await prisma.friendRequest.update({ where: { id: existing.id }, data: { status: 'PENDING', fromUserId: userId, toUserId: target.id, respondedAt: null } });
    return NextResponse.json({ ok: true });
  }

  const created = await prisma.friendRequest.create({ data: { fromUserId: userId, toUserId: target.id } });
  return NextResponse.json(created, { status: 201 });
}
