import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "recipes_ingredients_list" ADD COLUMN IF NOT EXISTS "is_section" boolean DEFAULT false;
    ALTER TABLE "_recipes_v_version_ingredients_list" ADD COLUMN IF NOT EXISTS "is_section" boolean DEFAULT false;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "recipes_ingredients_list" DROP COLUMN IF EXISTS "is_section";
    ALTER TABLE "_recipes_v_version_ingredients_list" DROP COLUMN IF EXISTS "is_section";
  `)
}


