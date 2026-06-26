import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isValidAnimal, normalizeLook, AVATAR_SELECT, lookOf } from '@/lib/interactions';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = parseInt(session.user.id);
  const profile = await prisma.interactionsProfile.findUnique({ where: { userId }, select: AVATAR_SELECT });
  return NextResponse.json({ has: !!profile, look: profile ? lookOf(profile) : null });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  if (!isValidAnimal(body.animal ?? body.avatar)) {
    return NextResponse.json({ error: 'Animal inválido.' }, { status: 400 });
  }
  const look = normalizeLook({ animal: body.animal ?? body.avatar, hat: body.hat, accessory: body.accessory, bg: body.bg });
  const data = { avatar: look.animal, hat: look.hat, accessory: look.accessory, bg: look.bg };

  const userId = parseInt(session.user.id);
  await prisma.interactionsProfile.upsert({ where: { userId }, update: data, create: { userId, ...data } });

  return NextResponse.json({ look });
}
