import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- dietType array table
    CREATE TABLE IF NOT EXISTS "search_diet_type" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "value" varchar
    );
    DO $$ BEGIN
      ALTER TABLE "search_diet_type" ADD CONSTRAINT "search_diet_type_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    CREATE INDEX IF NOT EXISTS "search_diet_type_order_idx" ON "search_diet_type" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "search_diet_type_parent_id_idx" ON "search_diet_type" USING btree ("_parent_id");

    -- tags array table
    CREATE TABLE IF NOT EXISTS "search_tags" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "value" varchar
    );
    DO $$ BEGIN
      ALTER TABLE "search_tags" ADD CONSTRAINT "search_tags_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    CREATE INDEX IF NOT EXISTS "search_tags_order_idx" ON "search_tags" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "search_tags_parent_id_idx" ON "search_tags" USING btree ("_parent_id");

    -- ingredients array table
    CREATE TABLE IF NOT EXISTS "search_ingredients" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "value" varchar
    );
    DO $$ BEGIN
      ALTER TABLE "search_ingredients" ADD CONSTRAINT "search_ingredients_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id")
      ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    CREATE INDEX IF NOT EXISTS "search_ingredients_order_idx" ON "search_ingredients" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "search_ingredients_parent_id_idx" ON "search_ingredients" USING btree ("_parent_id");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "search_diet_type" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "search_tags" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "search_ingredients" DISABLE ROW LEVEL SECURITY;
    DROP TABLE IF EXISTS "search_diet_type" CASCADE;
    DROP TABLE IF EXISTS "search_tags" CASCADE;
    DROP TABLE IF EXISTS "search_ingredients" CASCADE;
  `)
}


