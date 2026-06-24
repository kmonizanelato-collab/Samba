import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isValidAnimal } from '@/lib/interactions';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const avatar = body.avatar;
  if (!isValidAnimal(avatar)) return NextResponse.json({ error: 'Avatar inválido.' }, { status: 400 });

  const userId = parseInt(session.user.id);
  const profile = await prisma.interactionsProfile.upsert({
    where: { userId },
    update: { avatar },
    create: { userId, avatar },
  });

  return NextResponse.json(profile);
}
