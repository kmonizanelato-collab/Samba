import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        name: { label: 'Nome', type: 'text' },
        grade: { label: 'Série', type: 'text' },
        password: { label: 'Senha', type: 'password' },
        role: { label: 'Tipo', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) return null;

        const role = credentials.role || 'STUDENT';

        let user;
        if (role === 'STUDENT') {
          if (!credentials.grade) return null;
          user = await prisma.user.findFirst({
            where: {
              name: { equals: credentials.name, mode: 'insensitive' },
              grade: credentials.grade,
              role: 'STUDENT',
            },
          });
        } else {
          user = await prisma.user.findFirst({
            where: {
              name: { equals: credentials.name, mode: 'insensitive' },
              role: role as 'TEACHER' | 'ADMIN',
            },
          });
        }

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: String(user.id),
          name: user.name,
          role: user.role,
          grade: user.grade,
          level: user.level,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.grade = user.grade;
        token.level = user.level;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.grade = token.grade;
      session.user.level = token.level;
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
