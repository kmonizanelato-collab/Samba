import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { roomLabel } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function selectUser() {
  return { id: true, name: true, grade: true, interactionsProfile: { select: { avatar: true } } } as const;
}

function serializeUser(u: { id: number; name: string; grade: string | null; interactionsProfile: { avatar: string } | null }) {
  return {
    id: u.id,
    name: u.name,
    grade: u.grade,
    gradeLabel: u.grade ? roomLabel(u.grade) : null,
    avatar: u.interactionsProfile?.avatar ?? null,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const userId = parseInt(session.user.id);
  const [received, sent] = await Promise.all([
    prisma.friendRequest.findMany({
      where: { toUserId: userId, status: 'PENDING' },
      include: { fromUser: { select: selectUser() } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.friendRequest.findMany({
      where: { fromUserId: userId, status: 'PENDING' },
      include: { toUser: { select: selectUser() } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return NextResponse.json({
    received: received.map((r) => ({ id: r.id, createdAt: r.createdAt, user: serializeUser(r.fromUser) })),
    sent: sent.map((r) => ({ id: r.id, createdAt: r.createdAt, user: serializeUser(r.toUser) })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const name = (body.name ?? '').trim();
  const grade = (body.grade ?? '').trim();
  if (!name || !grade) return NextResponse.json({ error: 'Informe nome e sala.' }, { status: 400 });

  const userId = parseInt(session.user.id);
  const target = await prisma.user.findFirst({
    where: { name: { equals: name, mode: 'insensitive' }, grade, role: 'STUDENT' },
  });
  if (!target) return NextResponse.json({ error: 'Nenhum aluno encontrado com esse nome e sala.' }, { status: 404 });
  if (target.id === userId) return NextResponse.json({ error: 'Você não pode adicionar a si mesmo.' }, { status: 400 });

  const existing = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { fromUserId: userId, toUserId: target.id },
        { fromUserId: target.id, toUserId: userId },
      ],
    },
  });
  if (existing) {
    if (existing.status === 'ACCEPTED') return NextResponse.json({ error: 'Vocês já são amigos.' }, { status: 409 });
    if (existing.status === 'PENDING') return NextResponse.json({ error: 'Já existe um pedido pendente entre vocês.' }, { status: 409 });
    await prisma.friendRequest.update({ where: { id: existing.id }, data: { status: 'PENDING', fromUserId: userId, toUserId: target.id, respondedAt: null } });
    return NextResponse.json({ ok: true });
  }

  const created = await prisma.friendRequest.create({ data: { fromUserId: userId, toUserId: target.id } });
  return NextResponse.json(created, { status: 201 });
}
