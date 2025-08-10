import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Ensure search_rels supports linking to recipes
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "search_rels" ADD COLUMN IF NOT EXISTS "recipes_id" integer;

    DO $$ BEGIN
      ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_recipes_fk"
      FOREIGN KEY ("recipes_id") REFERENCES "public"."recipes"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE INDEX IF NOT EXISTS "search_rels_recipes_id_idx" ON "search_rels" USING btree ("recipes_id");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_recipes_fk";
    EXCEPTION WHEN undefined_object THEN NULL; END $$;

    DROP INDEX IF EXISTS "search_rels_recipes_id_idx";
    ALTER TABLE "search_rels" DROP COLUMN IF EXISTS "recipes_id";
  `)
}


