import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "recipes_steps" DROP COLUMN IF EXISTS "duration_minutes";
    EXCEPTION WHEN undefined_table THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "_recipes_v_version_steps" DROP COLUMN IF EXISTS "duration_minutes";
    EXCEPTION WHEN undefined_table THEN NULL; END $$;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "recipes_steps" ADD COLUMN IF NOT EXISTS "duration_minutes" numeric;
    EXCEPTION WHEN undefined_table THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "_recipes_v_version_steps" ADD COLUMN IF NOT EXISTS "duration_minutes" numeric;
    EXCEPTION WHEN undefined_table THEN NULL; END $$;
  `)
}


