import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ALL_ROOMS, roomLevel } from '@/lib/constants';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: 'Unauthorized', status: 401 as const, session: null };
  if (session.user.role !== 'ADMIN') return { error: 'Forbidden', status: 403 as const, session: null };
  return { error: null, status: 200 as const, session };
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, role: true, grade: true, level: true, createdAt: true },
    orderBy: [{ role: 'asc' }, { grade: 'asc' }, { name: 'asc' }],
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const name: string = (body.name ?? '').trim();
  const role: string = body.role;
  const grade: string | null = body.grade ? String(body.grade) : null;
  const password: string = body.password ?? '';

  if (!name) return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
  if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role))
    return NextResponse.json({ error: 'Tipo de conta inválido.' }, { status: 400 });
  if (!password || password.length < 4)
    return NextResponse.json({ error: 'Senha deve ter pelo menos 4 caracteres.' }, { status: 400 });

  let level: 'MEDIO' | 'FUNDAMENTAL' | null = null;
  if (role === 'STUDENT') {
    if (!grade || !ALL_ROOMS.includes(grade))
      return NextResponse.json({ error: 'Selecione uma sala válida para o aluno.' }, { status: 400 });
    level = roomLevel(grade);
  }

  // Checagem de duplicidade
  const dupe =
    role === 'STUDENT'
      ? await prisma.user.findFirst({ where: { name: { equals: name, mode: 'insensitive' }, grade, role: 'STUDENT' } })
      : await prisma.user.findFirst({ where: { name: { equals: name, mode: 'insensitive' }, role: role as 'TEACHER' | 'ADMIN' } });

  if (dupe)
    return NextResponse.json(
      { error: 'Já existe uma conta com esse nome' + (role === 'STUDENT' ? ' nessa sala.' : ' nesse tipo.') },
      { status: 409 }
    );

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, role: role as 'STUDENT' | 'TEACHER' | 'ADMIN', grade: role === 'STUDENT' ? grade : null, level, password: hashed },
    select: { id: true, name: true, role: true, grade: true, level: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get('id') ?? '');
  if (!id) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });

  if (id === parseInt(auth.session!.user.id))
    return NextResponse.json({ error: 'Você não pode excluir a sua própria conta.' }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
