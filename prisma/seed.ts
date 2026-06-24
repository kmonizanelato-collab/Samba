import { PrismaClient, Role, Level, NewsCategory } from '@prisma/client';
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
  await prisma.studentNews.deleteMany();

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

  await prisma.studentNews.createMany({
    data: [
      {
        title: 'Inscrição do ENEM 2026 está aberta',
        summary:
          'Concluintes do 3º ano: inscrições no portal oficial do INEP. Taxa de R$ 85,00 (se não isento) com pagamento até 10/06. Provas em 08 e 15 de novembro de 2026.',
        sourceName: 'INEP / ENEM',
        sourceUrl: 'https://enem.inep.gov.br/participante/',
        category: NewsCategory.ENEM,
        targetYears: [3],
        opensAt: new Date('2026-05-25T03:00:00.000Z'),
        closesAt: new Date('2026-06-06T02:59:00.000Z'),
        highlight: true,
      },
      {
        title: 'ENEM Treineiro 2026: pratique antes do vestibular',
        summary:
          'Mesmo sem concluir o ensino médio, você pode se inscrever como treineiro para testar seu desempenho. Inscrições pelo mesmo portal do INEP, dentro da mesma janela do ENEM regular.',
        sourceName: 'INEP / ENEM',
        sourceUrl: 'https://enem.inep.gov.br/participante/',
        category: NewsCategory.ENEM_TREINEIRO,
        targetYears: [1, 2],
        opensAt: new Date('2026-05-25T03:00:00.000Z'),
        closesAt: new Date('2026-06-06T02:59:00.000Z'),
        highlight: true,
      },
      {
        title: 'Vestibulinho do CTI Bauru (Unesp)',
        summary:
          'O Colégio Técnico Industrial "Prof. Isaac Portal Roldán", no campus da Unesp em Bauru, seleciona alunos para cursos técnicos integrados ao ensino médio. Processo anual pela Fundação Vunesp.',
        sourceName: 'CTI Bauru / Vunesp',
        sourceUrl: 'https://www.vunesp.com.br/',
        category: NewsCategory.VESTIBULINHO,
        targetYears: [9],
        highlight: true,
      },
      {
        title: 'Vestibulinho das Etecs (Centro Paula Souza)',
        summary:
          'Quem está no 9º ano pode concorrer a uma vaga de ensino médio técnico integrado em uma Etec. Acompanhe o calendário oficial para saber quando abrem as próximas inscrições.',
        sourceName: 'Centro Paula Souza',
        sourceUrl: 'https://vestibulinho.etec.sp.gov.br/',
        category: NewsCategory.VESTIBULINHO,
        targetYears: [9],
      },
      {
        title: 'Vestibular Unesp 2027 com inscrições abertas',
        summary:
          'Inscrições de 04/09 a 20/10/2026. 1ª fase em 22/11/2026 e 2ª fase em 13 e 14/12/2026. Cursos disponíveis também no campus de Bauru, pela Fundação Vunesp.',
        sourceName: 'Vunesp / Unesp',
        sourceUrl: 'https://vestibular.unesp.br/',
        category: NewsCategory.VESTIBULAR,
        targetYears: [3],
        opensAt: new Date('2026-09-04T03:00:00.000Z'),
        closesAt: new Date('2026-10-21T02:59:00.000Z'),
        highlight: true,
      },
      {
        title: 'Diretoria de Ensino da Região de Bauru',
        summary:
          'Fique por dentro de comunicados, processos seletivos e oportunidades educacionais da rede estadual na região de Bauru.',
        sourceName: 'Diretoria de Ensino - Região de Bauru',
        sourceUrl: 'https://debauru.educacao.sp.gov.br/',
        category: NewsCategory.GERAL,
        targetYears: [],
      },
    ],
  });

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
