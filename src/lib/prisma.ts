//  ──────────────────────────────────────────────────────────────────────
//  📘 O QUE É: Conexão única com o BANCO de dados (Prisma).
//  ⚙️  COMO FUNCIONA: Cria um PrismaClient só e reaproveita, para não abrir uma conexão nova a cada requisição.
//  🎓 NA BANCA: Prisma = ORM tipado: as consultas ao PostgreSQL são conferidas pelo TypeScript.
//  ──────────────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";

// Evita recriar o client a cada hot-reload em dev (padrão recomendado pela Vercel/Prisma).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
