import { PrismaClient, Role, Level } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const studentPassword = await bcrypt.hash('aluno@2026', 10);
  const teacherPassword = await bcrypt.hash('professor@2026', 10);
  const adminPassword = await bcrypt.hash('admin@2026', 10);

  await prisma.gradeGoal.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.agendaEntry.deleteMany();
  await prisma.studentAttendance.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: { name: 'Vinicios', role: Role.TEACHER, password: teacherPassword },
  });

  await prisma.user.create({
    data: { name: 'admin', role: Role.ADMIN, password: adminPassword },
  });

  const medioStudents = [
    { name: 'Henrico', grade: '2A' },
    { name: 'Isadora', grade: '2A' },
    { name: 'Martins', grade: '2A' },
    { name: 'Paulo', grade: '2B' },
    { name: 'Valentina', grade: '2B' },
    { name: 'Pablet', grade: '2B' },
    { name: 'Kaic', grade: '2C' },
    { name: 'Otavio', grade: '2C' },
    { name: 'Nicolas', grade: '2C' },
  ];

  const fundamentalStudents = [
    { name: 'Matheus', grade: '9A' },
    { name: 'João', grade: '9A' },
    { name: 'Julia', grade: '9A' },
    { name: 'Carlos', grade: '9B' },
    { name: 'Vanessa', grade: '9B' },
    { name: 'Pedro', grade: '9B' },
    { name: 'Paula', grade: '9C' },
    { name: 'Raul', grade: '9C' },
    { name: 'Kadu', grade: '9C' },
  ];

  for (const s of medioStudents) {
    await prisma.user.create({
      data: {
        name: s.name,
        grade: s.grade,
        role: Role.STUDENT,
        level: Level.MEDIO,
        password: studentPassword,
      },
    });
  }

  for (const s of fundamentalStudents) {
    await prisma.user.create({
      data: {
        name: s.name,
        grade: s.grade,
        role: Role.STUDENT,
        level: Level.FUNDAMENTAL,
        password: studentPassword,
      },
    });
  }

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
