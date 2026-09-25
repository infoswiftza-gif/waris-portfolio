import 'dotenv/config';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-mongo/config';

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./prisma/schema.ts",
    db: {
      connection: process.env['DATABASE_URL']!,
    },
  }),
});
