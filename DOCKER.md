# Rodando o SAMBA com Docker

Tudo (app Next.js + banco PostgreSQL) sobe com **um comando**. Você só precisa do
[Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e aberto.

## Subir o projeto

```bash
docker compose up --build
```

Na primeira vez ele vai: baixar as imagens, construir o app, criar o banco,
aplicar o schema e popular com os usuários de exemplo. Quando aparecer
`Iniciando o Samba`, acesse:

👉 **http://localhost:3000**

## Parar

```bash
docker compose down
```

Os dados do banco ficam salvos no volume `samba_db_data` (não se perdem ao parar).
Para apagar **tudo**, inclusive o banco:

```bash
docker compose down -v
```

## Logins de exemplo

| Perfil    | Usuário    | Senha            |
|-----------|------------|------------------|
| Admin     | `admin`    | `admin@2026`     |
| Professor | `Vinicios` | `professor@2026` |
| Aluno     | `Kaic` (sala `2C`) | `aluno@2026` |

## Detalhes

- **App**: porta `3000` → http://localhost:3000
- **Banco**: PostgreSQL 16, exposto na porta `5433` da sua máquina
  (interno do container é `5432`). Usei `5433` para não conflitar com um
  Postgres já instalado localmente.
- Variáveis de ambiente ficam no `docker-compose.yml`. **Troque o
  `NEXTAUTH_SECRET`** antes de usar em produção.
- O seed só roda quando o banco está vazio; reiniciar não apaga seus dados.
