import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Add missing enum values to ingredient unit enums
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- recipes enum
    DO $$ BEGIN
      ALTER TYPE "public"."enum_recipes_ingredients_list_unit" ADD VALUE IF NOT EXISTS 'prise';
    EXCEPTION WHEN undefined_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TYPE "public"."enum_recipes_ingredients_list_unit" ADD VALUE IF NOT EXISTS 'schuss';
    EXCEPTION WHEN undefined_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TYPE "public"."enum_recipes_ingredients_list_unit" ADD VALUE IF NOT EXISTS 'dose';
    EXCEPTION WHEN undefined_object THEN NULL; END $$;

    -- versions enum
    DO $$ BEGIN
      ALTER TYPE "public"."enum__recipes_v_version_ingredients_list_unit" ADD VALUE IF NOT EXISTS 'prise';
    EXCEPTION WHEN undefined_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TYPE "public"."enum__recipes_v_version_ingredients_list_unit" ADD VALUE IF NOT EXISTS 'schuss';
    EXCEPTION WHEN undefined_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TYPE "public"."enum__recipes_v_version_ingredients_list_unit" ADD VALUE IF NOT EXISTS 'dose';
    EXCEPTION WHEN undefined_object THEN NULL; END $$;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Postgres enums do not support removing values easily; leave as is.
}


