import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Align search array tables to use varchar ids (plugin inserts string ids)
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- dietType
    DO $$ BEGIN
      ALTER TABLE "search_diet_type" ALTER COLUMN "id" DROP DEFAULT;
    EXCEPTION WHEN undefined_table THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "search_diet_type" ALTER COLUMN "id" TYPE varchar USING "id"::varchar;
    EXCEPTION WHEN undefined_table THEN NULL; END $$;

    -- tags
    DO $$ BEGIN
      ALTER TABLE "search_tags" ALTER COLUMN "id" DROP DEFAULT;
    EXCEPTION WHEN undefined_table THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "search_tags" ALTER COLUMN "id" TYPE varchar USING "id"::varchar;
    EXCEPTION WHEN undefined_table THEN NULL; END $$;

    -- ingredients
    DO $$ BEGIN
      ALTER TABLE "search_ingredients" ALTER COLUMN "id" DROP DEFAULT;
    EXCEPTION WHEN undefined_table THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "search_ingredients" ALTER COLUMN "id" TYPE varchar USING "id"::varchar;
    EXCEPTION WHEN undefined_table THEN NULL; END $$;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Best-effort revert to integer ids (will fail if non-numeric ids exist) – keep safe guards
  await payload.db.drizzle.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "search_diet_type" ALTER COLUMN "id" TYPE integer USING NULLIF("id", '')::integer;
    EXCEPTION WHEN undefined_table THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "search_tags" ALTER COLUMN "id" TYPE integer USING NULLIF("id", '')::integer;
    EXCEPTION WHEN undefined_table THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "search_ingredients" ALTER COLUMN "id" TYPE integer USING NULLIF("id", '')::integer;
    EXCEPTION WHEN undefined_table THEN NULL; END $$;
  `)
}


