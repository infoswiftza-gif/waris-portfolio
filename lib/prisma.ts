import { cms, cmsDb, type Contract } from '@/prisma/db';

export { cms, cmsDb, type Contract };

export type PrismaClient = typeof cms;
export type PrismaDb = typeof cms;
