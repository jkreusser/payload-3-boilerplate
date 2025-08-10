import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "recipes_ingredients_list"
    ALTER COLUMN "quantity" TYPE numeric
    USING NULLIF(trim("quantity"::text), '')::numeric;

    ALTER TABLE "_recipes_v_version_ingredients_list"
    ALTER COLUMN "quantity" TYPE numeric
    USING NULLIF(trim("quantity"::text), '')::numeric;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "recipes_ingredients_list"
    ALTER COLUMN "quantity" TYPE varchar;

    ALTER TABLE "_recipes_v_version_ingredients_list"
    ALTER COLUMN "quantity" TYPE varchar;
  `)
}
