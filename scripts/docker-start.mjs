// Inicialização dentro do container:
// 1) aplica o schema no banco  2) popula se estiver vazio  3) inicia o Next
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

console.log('==> Aplicando schema no banco (prisma db push)...');
run('npx prisma db push --skip-generate --accept-data-loss');

let count = 0;
try {
  const prisma = new PrismaClient();
  count = await prisma.user.count();
  await prisma.$disconnect();
} catch (e) {
  console.log('Aviso: não consegui contar usuários:', e.message);
}

if (count === 0) {
  console.log('==> Banco vazio — populando com o seed...');
  run('npx ts-node --project tsconfig.seed.json prisma/seed.ts');
} else {
  console.log(`==> ${count} usuário(s) já existem — pulando o seed.`);
}

console.log('==> Iniciando o Samba em http://localhost:3000');
run('npm run start');
